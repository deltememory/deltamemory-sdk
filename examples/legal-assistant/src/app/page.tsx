"use client";

import { useState, useCallback } from "react";
import { cases, LegalCase } from "@/lib/cases";
import { Session } from "@/lib/sessions";
import { CaseSelector } from "@/components/case-selector";
import { Chat } from "@/components/chat";
import { SessionChat } from "@/components/session-chat";
import { StatsPanel } from "@/components/stats-panel";
import { SessionStatsPanel } from "@/components/session-stats-panel";
import { DocumentList } from "@/components/document-list";
import { NewSession } from "@/components/new-session";
import { PastSessions } from "@/components/past-sessions";

type ViewMode = "select" | "demo" | "new-session" | "past-sessions" | "session";

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("select");
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [lastRecallTime, setLastRecallTime] = useState<number>();
  const [lastStoreTime, setLastStoreTime] = useState<number>();

  const handleToolLatency = useCallback((type: "recall" | "store", ms: number) => {
    if (type === "recall") setLastRecallTime(ms);
    else setLastStoreTime(ms);
  }, []);

  const handleSelectDemo = (c: LegalCase) => {
    setSelectedCase(c);
    setViewMode("demo");
  };

  const handleNewSession = () => {
    setViewMode("new-session");
  };

  const handlePastSessions = () => {
    setViewMode("past-sessions");
  };

  const handleSessionCreated = (session: Session) => {
    setCurrentSession(session);
    setViewMode("session");
  };

  const handleBack = () => {
    setViewMode("select");
    setSelectedCase(null);
    setCurrentSession(null);
  };

  return (
    <main className="h-screen flex flex-col p-6 max-w-[1600px] mx-auto">
      <header className="mb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚖️</span>
            <div>
              <h1 className="text-xl font-semibold">Legal Research Assistant</h1>
              <p className="text-sm text-[var(--text-muted)]">
                AI with case memory — contracts, depositions, communications
              </p>
            </div>
          </div>
          {viewMode !== "select" && (
            <button
              onClick={handleBack}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              ← Back to selection
            </button>
          )}
        </div>
      </header>

      {/* Selection View */}
      {viewMode === "select" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="text-center max-w-lg">
            <h2 className="text-2xl font-semibold mb-2">Get Started</h2>
            <p className="text-[var(--text-muted)]">
              Try the demo case, upload documents, or continue a past session
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 w-full max-w-3xl">
            {/* Demo Case */}
            <button
              onClick={() => handleSelectDemo(cases[0])}
              className="p-6 border border-[var(--border)] rounded-lg text-left hover:border-[var(--accent)] transition-colors"
            >
              <div className="text-3xl mb-3">📁</div>
              <div className="font-semibold mb-1">Demo Case</div>
              <div className="text-sm text-[var(--text-muted)] mb-3">
                TechFlow v. DataSync — Breach of contract
              </div>
              <div className="text-xs text-[var(--accent)]">
                Pre-loaded →
              </div>
            </button>

            {/* New Session */}
            <button
              onClick={handleNewSession}
              className="p-6 border border-[var(--border)] rounded-lg text-left hover:border-[var(--accent)] transition-colors"
            >
              <div className="text-3xl mb-3">📤</div>
              <div className="font-semibold mb-1">Upload Documents</div>
              <div className="text-sm text-[var(--text-muted)] mb-3">
                Upload PDFs to start a new session
              </div>
              <div className="text-xs text-[var(--accent)]">
                New session →
              </div>
            </button>

            {/* Past Sessions */}
            <button
              onClick={handlePastSessions}
              className="p-6 border border-[var(--border)] rounded-lg text-left hover:border-[var(--accent)] transition-colors"
            >
              <div className="text-3xl mb-3">🕐</div>
              <div className="font-semibold mb-1">Past Sessions</div>
              <div className="text-sm text-[var(--text-muted)] mb-3">
                Continue a previous research session
              </div>
              <div className="text-xs text-[var(--accent)]">
                Load session →
              </div>
            </button>
          </div>
        </div>
      )}

      {/* New Session View */}
      {viewMode === "new-session" && (
        <div className="flex-1 flex items-center justify-center">
          <NewSession
            onSessionCreated={handleSessionCreated}
            onCancel={handleBack}
          />
        </div>
      )}

      {/* Past Sessions View */}
      {viewMode === "past-sessions" && (
        <div className="flex-1 flex items-center justify-center">
          <PastSessions
            onSelectSession={handleSessionCreated}
            onBack={handleBack}
          />
        </div>
      )}

      {/* Demo Case View */}
      {viewMode === "demo" && selectedCase && (
        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
          <div className="col-span-2 flex flex-col min-h-0">
            <Chat caseData={selectedCase} onToolLatency={handleToolLatency} />
          </div>
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex-shrink-0">
              <StatsPanel
                caseData={selectedCase}
                lastRecallTime={lastRecallTime}
                lastStoreTime={lastStoreTime}
              />
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
              <DocumentList caseId={selectedCase.id} />
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Session View */}
      {viewMode === "session" && currentSession && (
        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
          <div className="col-span-2 flex flex-col min-h-0">
            <SessionChat session={currentSession} onToolLatency={handleToolLatency} />
          </div>
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex-shrink-0">
              <SessionStatsPanel
                session={currentSession}
                lastRecallTime={lastRecallTime}
                lastStoreTime={lastStoreTime}
              />
            </div>
            <div className="flex-1 min-h-0 overflow-auto border border-[var(--border)] rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">Session Documents</h3>
              <div className="space-y-2">
                {currentSession.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-2 p-2 rounded bg-[var(--bg-secondary)]"
                  >
                    <span>📄</span>
                    <span className="text-sm truncate">{doc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
