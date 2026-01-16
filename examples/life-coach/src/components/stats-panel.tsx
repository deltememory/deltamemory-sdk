"use client";

import { useEffect, useState } from "react";
import { User } from "@/lib/users";

interface Stats {
  memory_count: number;
  fact_count: number;
  profile_count: number;
  event_count: number;
  latency: { stats: number };
}

interface StatsPanelProps {
  user: User;
  lastRecallTime?: number;
  lastStoreTime?: number;
}

export function StatsPanel({ user, lastRecallTime, lastStoreTime }: StatsPanelProps) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch(`/api/stats?userId=${user.id}`);
      const data = await res.json();
      setStats(data);
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        <Stat label="Memories" value={stats?.memory_count ?? 0} />
        <Stat label="Facts" value={stats?.fact_count ?? 0} />
        <Stat label="Profiles" value={stats?.profile_count ?? 0} />
        <Stat label="Events" value={stats?.event_count ?? 0} />
      </div>

      <div className="flex gap-4 text-xs">
        <LatencyStat label="Recall" value={lastRecallTime} />
        <LatencyStat label="Store" value={lastStoreTime} />
        <LatencyStat label="Stats" value={stats?.latency.stats} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[var(--bg-secondary)] rounded px-2 py-1.5 text-center">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-[10px] text-[var(--text-muted)]">{label}</div>
    </div>
  );
}

function LatencyStat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[var(--text-muted)]">{label}:</span>
      <span className="font-mono">{value !== undefined ? `${value}ms` : "—"}</span>
    </div>
  );
}
