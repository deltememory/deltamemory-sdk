"use client";

export interface TranscriptEntry {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

interface TranscriptProps {
  entries: TranscriptEntry[];
}

export function Transcript({ entries }: TranscriptProps) {
  if (entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[var(--muted)]">Start speaking to begin...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-3 p-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
              entry.role === "user"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--card)] text-[var(--foreground)]"
            } ${!entry.isFinal ? "opacity-60" : ""}`}
          >
            <p className="text-sm">{entry.text}</p>
            <p className="text-xs opacity-50 mt-1">
              {entry.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
