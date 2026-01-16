"use client";

export interface ToolCall {
  id: string;
  tool: string;
  agent: "tutor" | "practice";
  status: "running" | "done";
  latency?: number;
  timestamp: number;
}

interface ToolActivityProps {
  calls: ToolCall[];
}

const toolIcons: Record<string, string> = {
  recallMemory: "🧠",
  storeMemory: "💾",
  assessUnderstanding: "📊",
  trackProgress: "📈",
  generateExercise: "✏️",
};

export function ToolActivity({ calls }: ToolActivityProps) {
  const recentCalls = calls.slice(-8);

  return (
    <div className="border border-[var(--border)] rounded-lg">
      <div className="px-3 py-2 border-b border-[var(--border)]">
        <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
          Agent Activity
        </span>
      </div>
      <div className="p-2 space-y-1 max-h-[200px] overflow-y-auto">
        {recentCalls.length === 0 ? (
          <div className="text-xs text-[var(--text-muted)] text-center py-4">
            No activity yet
          </div>
        ) : (
          recentCalls.map((call) => (
            <div
              key={call.id}
              className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[var(--bg-secondary)]"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    call.agent === "tutor" ? "bg-[var(--tutor)]" : "bg-[var(--practice)]"
                  }`}
                />
                <span>{toolIcons[call.tool] || "🔧"}</span>
                <span className="text-[var(--text-muted)]">{call.tool}</span>
              </div>
              <span className="font-mono text-[var(--text-muted)]">
                {call.status === "running" ? "..." : `${call.latency}ms`}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
