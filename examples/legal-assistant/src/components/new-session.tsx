"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { PdfUpload } from "./pdf-upload";
import { Session } from "@/lib/sessions";

interface NewSessionProps {
  onSessionCreated: (session: Session) => void;
  onCancel: () => void;
}

export function NewSession({ onSessionCreated, onCancel }: NewSessionProps) {
  const [sessionName, setSessionName] = useState("");
  const [sessionId] = useState(() => uuidv4().slice(0, 8));
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ name: string; stats: any }>>([]);
  const [isReady, setIsReady] = useState(false);

  const handleUploadComplete = (stats: { memory_count: number; fact_count: number }) => {
    setUploadedDocs((prev) => [...prev, { name: "Document", stats }]);
    setIsReady(true);
  };

  const handleStartSession = () => {
    if (!sessionName.trim()) {
      alert("Please enter a session name");
      return;
    }

    const session: Session = {
      id: sessionId,
      name: sessionName,
      collection: `legal-session-${sessionId}`,
      documents: uploadedDocs.map((d, i) => ({
        id: `doc-${i}`,
        name: d.name,
        type: "pdf",
        uploadedAt: new Date(),
      })),
      createdAt: new Date(),
    };

    onSessionCreated(session);
  };

  return (
    <div className="border border-[var(--border)] rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">New Research Session</h2>
        <button
          onClick={onCancel}
          className="text-[var(--text-muted)] hover:text-[var(--text)] text-sm"
        >
          Cancel
        </button>
      </div>

      {/* Session Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Session Name</label>
        <input
          type="text"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          placeholder="e.g., Smith v. Jones Contract Review"
          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      {/* PDF Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Upload Documents</label>
        <PdfUpload sessionId={sessionId} onUploadComplete={handleUploadComplete} />
      </div>

      {/* Uploaded docs list */}
      {uploadedDocs.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Uploaded Documents</label>
          <div className="space-y-2">
            {uploadedDocs.map((doc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span>📄</span>
                  <span className="text-sm">{doc.name}</span>
                </div>
                <span className="text-xs text-[var(--text-muted)]">
                  {doc.stats.memory_count} memories, {doc.stats.fact_count} facts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start button */}
      <button
        onClick={handleStartSession}
        disabled={!isReady || !sessionName.trim()}
        className="w-full py-3 rounded-lg bg-[var(--accent)] text-white font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        Start Research Session
      </button>
    </div>
  );
}
