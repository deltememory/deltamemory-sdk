"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { Session } from "@/lib/sessions";

interface SessionChatProps {
  session: Session;
  onToolLatency?: (type: "recall" | "store", ms: number) => void;
}

export function SessionChat({ session, onToolLatency }: SessionChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toolStartTimes = useRef<Map<string, number>>(new Map());

  const { messages, sendMessage, status, setMessages } = useChat({
    id: session.id,
    transport: new DefaultChatTransport({
      api: "/api/session-chat",
      body: { sessionId: session.id },
    }),
  });

  useEffect(() => {
    setMessages([]);
  }, [session.id, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    messages.forEach((message) => {
      message.parts.forEach((part) => {
        if (part.type === "tool-recallMemory" || part.type === "tool-storeMemory") {
          const toolType = part.type === "tool-recallMemory" ? "recall" : "store";
          const callId = part.toolCallId;

          if (part.state === "input-available" && !toolStartTimes.current.has(callId)) {
            toolStartTimes.current.set(callId, performance.now());
          }

          if (part.state === "output-available" && toolStartTimes.current.has(callId)) {
            const startTime = toolStartTimes.current.get(callId)!;
            const latency = Math.round(performance.now() - startTime);
            toolStartTimes.current.delete(callId);
            onToolLatency?.(toolType, latency);
          }
        }
      });
    });
  }, [messages, onToolLatency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === "ready") {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full border border-[var(--border)] rounded-lg">
      <div className="px-4 py-2 border-b border-[var(--border)] flex-shrink-0">
        <span className="font-medium">{session.name}</span>
        <span className="text-sm text-[var(--text-muted)] ml-2">
          {session.documents.length} document(s)
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-[var(--text-muted)] text-sm py-8">
            <p className="mb-2">Documents uploaded and indexed.</p>
            <p>Ask questions about your documents — contracts, clauses, dates, parties, etc.</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                message.role === "user"
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-secondary)] border border-[var(--border)]"
              }`}
            >
              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <span key={i} className="whitespace-pre-wrap">
                      {part.text}
                    </span>
                  );
                }
                if (part.type === "tool-recallMemory" || part.type === "tool-storeMemory") {
                  if (part.state === "output-available") return null;
                  return (
                    <span key={i} className="text-xs text-[var(--text-muted)] italic block">
                      {part.type === "tool-recallMemory" ? "🔍 searching documents..." : "💾 noting..."}
                    </span>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}

        {(status === "submitted" || status === "streaming") && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
              <span className="text-[var(--text-muted)] text-sm">...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-[var(--border)] flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your documents..."
            disabled={status !== "ready"}
            className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm focus:outline-none focus:border-[var(--accent)] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status !== "ready" || !input.trim()}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
