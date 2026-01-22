"use client";

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: Record<string, unknown>;
  timestamp: Date;
}

interface ToolActivityProps {
  toolCalls: ToolCall[];
}

export function ToolActivity({ toolCalls }: ToolActivityProps) {
  if (toolCalls.length === 0) {
    return (
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-medium text-[var(--muted)] mb-3">Tool Activity</h3>
        <p className="text-sm text-[var(--muted)]">No tool calls yet</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-medium text-[var(--muted)] mb-3">Tool Activity</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {toolCalls.slice(-10).reverse().map((call) => (
          <div key={call.id} className="bg-[var(--background)] rounded-lg p-2 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[var(--accent)] font-mono">{call.name}</span>
              <span className="text-[var(--muted)]">
                {call.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <pre className="text-[var(--muted)] overflow-x-auto">
              {JSON.stringify(call.args, null, 2)}
            </pre>
            {call.result && (
              <div className="mt-1 pt-1 border-t border-[var(--border)]">
                <span className="text-green-400">✓ </span>
                <span className="text-[var(--muted)]">
                  {JSON.stringify(call.result).slice(0, 100)}
                  {JSON.stringify(call.result).length > 100 ? "..." : ""}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
