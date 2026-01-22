"use client";

import { useState, useCallback } from "react";
import { users, User } from "@/lib/users";
import { UserSelector } from "@/components/user-selector";
import { StatsPanel } from "@/components/stats-panel";
import { VoiceInterface } from "@/components/voice-interface";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User>(users[0]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMemoryUpdate = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-[var(--border)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h1 className="text-xl font-semibold">Second Brain</h1>
              <p className="text-sm text-[var(--muted)]">Voice-powered memory assistant</p>
            </div>
          </div>
          <UserSelector currentUser={currentUser} onUserChange={setCurrentUser} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Voice interface */}
        <div className="flex-1 flex flex-col border-r border-[var(--border)]">
          <VoiceInterface userId={currentUser.id} onMemoryUpdate={handleMemoryUpdate} />
        </div>

        {/* Sidebar */}
        <aside className="w-80 p-4 space-y-4">
          {/* <StatsPanel userId={currentUser.id} refreshTrigger={refreshTrigger} /> */}

          <div className="glass rounded-xl p-4">
            <h3 className="text-sm font-medium text-[var(--muted)] mb-3">How to use</h3>
            <ul className="text-sm text-[var(--foreground)] space-y-2">
              <li>🎤 Click "Start Conversation" to begin</li>
              <li>💬 Speak naturally - share ideas, notes, or questions</li>
              <li>🧠 Say "remember this" to save important info</li>
              <li>🔍 Ask "what do I know about X" to recall</li>
              <li>📋 Ask "what have I been thinking about" for recent notes</li>
            </ul>
          </div>

          <div className="glass rounded-xl p-4">
            <h3 className="text-sm font-medium text-[var(--muted)] mb-3">Powered by</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-[var(--background)] rounded text-xs">Azure OpenAI</span>
              <span className="px-2 py-1 bg-[var(--background)] rounded text-xs">GPT Realtime</span>
              <span className="px-2 py-1 bg-[var(--background)] rounded text-xs">DeltaMemory</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
