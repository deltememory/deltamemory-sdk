"use client";

import { useState, useCallback } from "react";
import { users, User } from "@/lib/users";
import { UserSelector } from "@/components/user-selector";
import { Chat } from "@/components/chat";
import { StatsPanel } from "@/components/stats-panel";
import { KnowledgeGraph } from "@/components/knowledge-graph";

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [lastRecallTime, setLastRecallTime] = useState<number>();
  const [lastStoreTime, setLastStoreTime] = useState<number>();

  const handleToolLatency = useCallback((type: "recall" | "store", ms: number) => {
    if (type === "recall") setLastRecallTime(ms);
    else setLastStoreTime(ms);
  }, []);

  return (
    <main className="h-screen flex flex-col p-6 max-w-[1400px] mx-auto">
      <header className="mb-4 flex-shrink-0">
        <h1 className="text-xl font-semibold">Life Coach</h1>
        <p className="text-sm text-[var(--text-muted)]">
          AI with persistent memory — remembers your journey, notices patterns
        </p>
      </header>

      <section className="mb-4 flex-shrink-0">
        <UserSelector users={users} selected={selectedUser} onSelect={setSelectedUser} />
      </section>

      {selectedUser ? (
        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
          <div className="flex flex-col min-h-0">
            <Chat user={selectedUser} onToolLatency={handleToolLatency} />
          </div>
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex-shrink-0">
              <StatsPanel
                user={selectedUser}
                lastRecallTime={lastRecallTime}
                lastStoreTime={lastStoreTime}
              />
            </div>
            <div className="flex-1 min-h-0">
              <KnowledgeGraph user={selectedUser} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 border border-[var(--border)] rounded-lg flex items-center justify-center text-[var(--text-muted)]">
          Select a user to start
        </div>
      )}
    </main>
  );
}
