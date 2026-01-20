"use client";

import { useState, useEffect } from "react";
import { Session } from "@/lib/sessions";

interface PastSession {
  id: string;
  collection: string;
  name: string;
}

interface PastSessionsProps {
  onSelectSession: (session: Session) => void;
  onBack: () => void;
}

export function PastSessions({ onSelectSession, onBack }: PastSessionsProps) {
  const [sessions, setSessions] = useState<PastSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/sessions");
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setSessions(data.sessions || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (session: PastSession) => {
    // Convert to Session format
    onSelectSession({
      id: session.id,
      name: session.name,
      collection: session.collection,
      documents: [], // We don't have doc info stored
      createdAt: new Date(),
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-md p-6 border border-[var(--border)] rounded-lg">
        <div className="text-center text-[var(--text-muted)]">
          Loading sessions...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-6 border border-[var(--border)] rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Past Sessions</h2>
        <button
          onClick={onBack}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          ← Back
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded">
          {error}
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-muted)]">
          <div className="text-3xl mb-2">📭</div>
          <p>No past sessions found</p>
          <p className="text-xs mt-1">Upload documents to create a session</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => handleSelect(session)}
              className="w-full p-3 text-left border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📁</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate capitalize">
                    {session.name}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {session.collection}
                  </div>
                </div>
                <span className="text-[var(--text-muted)]">→</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
