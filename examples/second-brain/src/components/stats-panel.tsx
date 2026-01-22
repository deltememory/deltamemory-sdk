"use client";

import { useEffect, useState } from "react";

interface Stats {
  memoryCount: number;
  factCount: number;
  conceptCount: number;
  profileCount: number;
  eventCount: number;
}

interface StatsPanelProps {
  userId: string;
  refreshTrigger?: number;
}

export function StatsPanel({ userId, refreshTrigger }: StatsPanelProps) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch(`/api/stats?userId=${userId}`)
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, [userId, refreshTrigger]);

  if (!stats) {
    return (
      <div className="glass rounded-xl p-4">
        <h3 className="text-sm font-medium text-[var(--muted)] mb-3">Memory Stats</h3>
        <p className="text-sm text-[var(--muted)]">Loading...</p>
      </div>
    );
  }

  const statItems = [
    { label: "Memories", value: stats.memoryCount ?? 0, icon: "🧠" },
    { label: "Facts", value: stats.factCount ?? 0, icon: "📝" },
    { label: "Concepts", value: stats.conceptCount ?? 0, icon: "💡" },
    { label: "Profiles", value: stats.profileCount ?? 0, icon: "👤" },
    { label: "Events", value: stats.eventCount ?? 0, icon: "📅" },
  ];

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="text-sm font-medium text-[var(--muted)] mb-3">Memory Stats</h3>
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span>{item.icon}</span>
            <div>
              <p className="text-lg font-semibold">{item.value}</p>
              <p className="text-xs text-[var(--muted)]">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
