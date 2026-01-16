"use client";

import { useEffect, useState } from "react";
import { Student } from "@/lib/students";

interface Stats {
  memory_count: number;
  fact_count: number;
  profile_count: number;
  event_count: number;
  latency: { stats: number };
}

interface StatsPanelProps {
  student: Student;
}

export function StatsPanel({ student }: StatsPanelProps) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch(`/api/stats?studentId=${student.id}`);
      const data = await res.json();
      setStats(data);
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [student.id]);

  return (
    <div className="grid grid-cols-4 gap-2">
      <Stat label="Memories" value={stats?.memory_count ?? 0} />
      <Stat label="Facts" value={stats?.fact_count ?? 0} />
      <Stat label="Profiles" value={stats?.profile_count ?? 0} />
      <Stat label="Events" value={stats?.event_count ?? 0} />
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
