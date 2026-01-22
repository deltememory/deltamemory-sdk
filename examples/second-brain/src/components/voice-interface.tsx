"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Transcript, TranscriptEntry } from "./transcript";
import { ToolCall, ToolActivity } from "./tool-activity";

interface VoiceInterfaceProps {
  userId: string;
  onMemoryUpdate: () => void;
}

type ConnectionStatus = "disconnected" | "connecting" | "connected";
type MemoryToolName = "save_to_memory" | "recall_memory" | "list_recent_memories";

export function VoiceInterface({ userId, onMemoryUpdate }: VoiceInterfaceProps) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Handle tool calls from the model
  const handleToolCall = useCallback(
    async (name: MemoryToolName, args: Record<string, unknown>, callId: string, itemId: string) => {
      const toolCall: ToolCall = {
        id: callId,
        name,
        args,
        timestamp: new Date(),
      };
      setToolCalls((prev) => [...prev, toolCall]);

      let result: Record<string, unknown>;
      try {
        const response = await fetch("/api/memory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: name === "save_to_memory" ? "save" : name === "recall_memory" ? "recall" : "recent",
            userId,
            ...args,
          }),
        });
        result = await response.json() as Record<string, unknown>;
        onMemoryUpdate();
      } catch (err) {
        result = { error: err instanceof Error ? err.message : "Unknown error" };
      }

      // Update tool call with result
      setToolCalls((prev) => prev.map((tc) => (tc.id === callId ? { ...tc, result } : tc)));

      const resultText = JSON.stringify(result).slice(0, 15000);

      // Send function response back via data channel (matching working example format)
      if (dataChannelRef.current?.readyState === "open") {
        // Create function call output with previous_item_id
        dataChannelRef.current.send(
          JSON.stringify({
            type: "conversation.item.create",
            previous_item_id: itemId,
            item: {
              type: "function_call_output",
              call_id: callId,
              output: resultText,
            },
          })
        );
        // Trigger response generation
        dataChannelRef.current.send(JSON.stringify({ type: "response.create" }));
      }
    },
    [userId, onMemoryUpdate]
  );

  // Handle data channel messages
  const handleDataChannelMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received event:", data.type, data);

        switch (data.type) {
          case "input_audio_buffer.speech_started":
            setIsListening(true);
            break;

          case "input_audio_buffer.speech_stopped":
            setIsListening(false);
            break;

          case "conversation.item.input_audio_transcription.completed":
            if (data.transcript) {
              setTranscript((prev) => [
                ...prev,
                {
                  id: `user-${Date.now()}`,
                  role: "user",
                  text: data.transcript,
                  timestamp: new Date(),
                  isFinal: true,
                },
              ]);
            }
            break;

          case "response.audio_transcript.delta":
          case "response.output_audio_transcript.delta":
            setTranscript((prev) => {
              const lastEntry = prev[prev.length - 1];
              if (lastEntry?.role === "assistant" && !lastEntry.isFinal) {
                return [...prev.slice(0, -1), { ...lastEntry, text: lastEntry.text + (data.delta || "") }];
              }
              return [
                ...prev,
                {
                  id: data.item_id || `assistant-${Date.now()}`,
                  role: "assistant",
                  text: data.delta || "",
                  timestamp: new Date(),
                  isFinal: false,
                },
              ];
            });
            break;

          case "response.audio_transcript.done":
          case "response.output_audio_transcript.done":
            setTranscript((prev) => {
              const lastEntry = prev[prev.length - 1];
              if (lastEntry?.role === "assistant") {
                return [...prev.slice(0, -1), { ...lastEntry, text: data.transcript || lastEntry.text, isFinal: true }];
              }
              return prev;
            });
            break;

          case "response.function_call_arguments.done":
            if (data.name && data.arguments) {
              try {
                const args = JSON.parse(data.arguments);
                // Pass item_id for proper conversation threading
                handleToolCall(data.name as MemoryToolName, args, data.call_id, data.item_id);
              } catch (e) {
                console.error("Failed to parse function arguments:", e);
              }
            }
            break;

          case "error":
            console.error("Realtime API error:", data.error);
            setError(data.error?.message || "Unknown error");
            break;
        }
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    },
    [handleToolCall]
  );

  // Connect using WebRTC
  const connect = useCallback(async () => {
    setStatus("connecting");
    setError(null);

    try {
      // Get ephemeral token from our server
      const tokenRes = await fetch(`/api/realtime/token?userId=${userId}`);
      if (!tokenRes.ok) {
        const err = await tokenRes.json();
        throw new Error(err.error || "Failed to get token");
      }
      const { token, webrtcUrl } = await tokenRes.json();

      // Create RTCPeerConnection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Set up audio playback
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioElementRef.current = audioEl;

      pc.ontrack = (event) => {
        console.log("Remote track received:", event.track.kind);
        if (event.streams.length > 0) {
          audioEl.srcObject = event.streams[0];
        }
      };

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const audioTrack = stream.getAudioTracks()[0];
      pc.addTrack(audioTrack);

      // Create data channel for events
      const dc = pc.createDataChannel("realtime-channel");
      dataChannelRef.current = dc;

      dc.onopen = () => {
        console.log("Data channel open");
        setStatus("connected");
      };

      dc.onmessage = handleDataChannelMessage;

      dc.onclose = () => {
        console.log("Data channel closed");
        setStatus("disconnected");
      };

      dc.onerror = (e) => {
        console.error("Data channel error:", e);
      };

      // Connection state logging
      pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          setStatus("disconnected");
          setError("Connection lost");
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log("ICE state:", pc.iceConnectionState);
      };

      // Create and send SDP offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Connect to Azure OpenAI Realtime WebRTC endpoint
      // Note: Don't use webrtcfilter=on as we need to receive function call events
      const sdpResponse = await fetch(webrtcUrl, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`SDP exchange failed: ${sdpResponse.status}`);
      }

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      console.log("WebRTC connection established");
    } catch (err) {
      console.error("Connection failed:", err);
      setError(err instanceof Error ? err.message : "Connection failed");
      setStatus("disconnected");
      cleanup();
    }
  }, [userId, handleDataChannelMessage]);

  // Cleanup resources
  const cleanup = useCallback(() => {
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    cleanup();
    setStatus("disconnected");
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Reset when user changes
  useEffect(() => {
    disconnect();
    setTranscript([]);
    setToolCalls([]);
  }, [userId, disconnect]);

  return (
    <div className="flex flex-col h-full">
      {/* Transcript area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Transcript entries={transcript} />
      </div>

      {/* Control area */}
      <div className="p-4 border-t border-[var(--border)]">
        {error && (
          <div className="mb-3 p-2 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          {status === "disconnected" ? (
            <button
              onClick={connect}
              className="px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-full font-medium transition-colors"
            >
              🎤 Start Conversation
            </button>
          ) : status === "connecting" ? (
            <div className="px-6 py-3 bg-[var(--card)] text-[var(--muted)] rounded-full">
              Connecting...
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* Listening indicator */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isListening ? "bg-green-500 animate-pulse" : "bg-[var(--muted)]"
                  }`}
                />
                <span className="text-sm text-[var(--muted)]">{isListening ? "Listening..." : "Ready"}</span>
              </div>

              <button
                onClick={disconnect}
                className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full font-medium transition-colors"
              >
                End Conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tool activity panel */}
      <div className="p-4 border-t border-[var(--border)]">
        <ToolActivity toolCalls={toolCalls} />
      </div>
    </div>
  );
}
