"use client";

import { useEffect, useState } from "react";
import { Session } from "@/lib/sessions";

interface SessionStatsPanelProps {
  session: Session;
  lastRecallTime?: number;
  lastStoreTime?: number;
}

interface Stats {
  memory_count: number;
  fact_count: number;
  concept_count: number;
}

export function SessionStatsPanel({ session, lastRecallTime, lastStoreTime }: SessionStatsPanelProps) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Extract the session ID without the "session-" prefix for the collection
        const sessionId = session.id.replace("session-", "");
        const res = await fetch(`/api/session-stats?sessionId=${sessionId}`);
        const data = await res.json();
        setStats(data);
      } catch {
        setStats(null);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [session.id]);

  return (
    <div className="border border-[var(--border)] rounded-lg p-4">
      <h3 className="text-sm font-medium mb-3">Document Memory</h3>
      
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-2xl font-semibold">{stats?.memory_count ?? "-"}</div>
          <div className="text-xs text-[var(--text-muted)]">Sections</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{stats?.fact_count ?? "-"}</div>
          <div className="text-xs text-[var(--text-muted)]">Facts</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{stats?.concept_count ?? "-"}</div>
          <div className="text-xs text-[var(--text-muted)]">Concepts</div>
        </div>
      </div>

      {(lastRecallTime || lastStoreTime) && (
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex gap-4 text-xs text-[var(--text-muted)]">
          {lastRecallTime && <span>🔍 {lastRecallTime}ms</span>}
          {lastStoreTime && <span>💾 {lastStoreTime}ms</span>}
        </div>
      )}
    </div>
  );
}
