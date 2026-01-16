"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { Student } from "@/lib/students";
import { AgentType } from "@/lib/agents";
import { ToolCall } from "./tool-activity";

interface ChatProps {
  student: Student;
  agent: AgentType;
  onToolCall: (call: ToolCall) => void;
}

export function Chat({ student, agent, onToolCall }: ChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toolStartTimes = useRef<Map<string, number>>(new Map());

  const { messages, sendMessage, status, setMessages } = useChat({
    id: `${student.id}-${agent}`,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { studentId: student.id, agent },
    }),
  });

  useEffect(() => {
    setMessages([]);
  }, [student.id, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track tool calls
  useEffect(() => {
    messages.forEach((message) => {
      message.parts.forEach((part) => {
        if (
          part.type === "tool-recallMemory" ||
          part.type === "tool-storeMemory" ||
          part.type === "tool-assessUnderstanding" ||
          part.type === "tool-trackProgress" ||
          part.type === "tool-generateExercise"
        ) {
          const toolName = part.type.replace("tool-", "");
          const callId = part.toolCallId;

          if (
            (part.state === "input-available" || part.state === "input-streaming") &&
            !toolStartTimes.current.has(callId)
          ) {
            toolStartTimes.current.set(callId, performance.now());
            onToolCall({
              id: callId,
              tool: toolName,
              agent,
              status: "running",
              timestamp: Date.now(),
            });
          }

          if (part.state === "output-available" && toolStartTimes.current.has(callId)) {
            const startTime = toolStartTimes.current.get(callId)!;
            const latency = Math.round(performance.now() - startTime);
            toolStartTimes.current.delete(callId);
            onToolCall({
              id: callId,
              tool: toolName,
              agent,
              status: "done",
              latency,
              timestamp: Date.now(),
            });
          }
        }
      });
    });
  }, [messages, agent, onToolCall]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === "ready") {
      sendMessage({ text: input });
      setInput("");
    }
  };

  const agentColor = agent === "tutor" ? "var(--tutor)" : "var(--practice)";
  const agentName = agent === "tutor" ? "TutorAgent" : "PracticeAgent";

  return (
    <div className="flex flex-col h-full border border-[var(--border)] rounded-lg">
      <div
        className="px-4 py-2 border-b flex items-center justify-between"
        style={{ borderColor: agentColor }}
      >
        <div>
          <span className="text-sm text-[var(--text-muted)]">Student:</span>
          <span className="ml-2 font-medium">{student.name}</span>
        </div>
        <div
          className="text-xs font-medium px-2 py-1 rounded"
          style={{ backgroundColor: agentColor, color: "white" }}
        >
          {agentName}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-[var(--text-muted)] text-sm py-8">
            {agent === "tutor"
              ? "Ask me to explain any programming concept"
              : "Ready to practice? Tell me what you want to work on"}
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
                  ? "bg-[var(--accent)] text-[var(--bg)]"
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
                if (
                  part.type === "tool-recallMemory" ||
                  part.type === "tool-storeMemory" ||
                  part.type === "tool-assessUnderstanding" ||
                  part.type === "tool-trackProgress" ||
                  part.type === "tool-generateExercise"
                ) {
                  if (part.state === "output-available") return null;
                  const toolName = part.type.replace("tool-", "");
                  const icons: Record<string, string> = {
                    recallMemory: "🧠",
                    storeMemory: "💾",
                    assessUnderstanding: "📊",
                    trackProgress: "📈",
                    generateExercise: "✏️",
                  };
                  return (
                    <span
                      key={i}
                      className="text-xs text-[var(--text-muted)] italic block"
                    >
                      {icons[toolName] || "🔧"} {toolName}...
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
            placeholder={
              agent === "tutor" ? "Ask about any concept..." : "Ready to practice..."
            }
            disabled={status !== "ready"}
            className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm focus:outline-none focus:border-[var(--accent)] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status !== "ready" || !input.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity text-white"
            style={{ backgroundColor: agentColor }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
