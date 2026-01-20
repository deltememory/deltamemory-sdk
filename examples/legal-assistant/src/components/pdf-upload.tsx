"use client";

import { useState, useRef, useEffect } from "react";
import { UploadProgress } from "@/lib/sessions";

interface PdfUploadProps {
  sessionId: string;
  onUploadComplete: (stats: { memory_count: number; fact_count: number }) => void;
}

export function PdfUpload({ sessionId, onUploadComplete }: PdfUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for progress
  useEffect(() => {
    if (uploading && sessionId) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/upload?sessionId=${sessionId}`);
          if (res.ok) {
            const data = await res.json();
            setProgress(data);
            
            if (data.status === "complete") {
              setUploading(false);
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
              }
            } else if (data.status === "error") {
              setUploading(false);
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
              }
            }
          }
        } catch {
          // Ignore polling errors
        }
      }, 500);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [uploading, sessionId]);

  const handleUpload = async (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      alert("Please upload a PDF file");
      return;
    }

    setUploading(true);
    setProgress({
      status: "parsing",
      progress: 0,
      total: 0,
      message: "Starting upload...",
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", sessionId);
    formData.append("fileName", file.name);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        onUploadComplete(data.stats);
      } else {
        setProgress({
          status: "error",
          progress: 0,
          total: 0,
          message: "Upload failed",
          error: data.error,
        });
        setUploading(false);
      }
    } catch (error: any) {
      setProgress({
        status: "error",
        progress: 0,
        total: 0,
        message: "Upload failed",
        error: error.message,
      });
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const progressPercent = progress?.total ? Math.round((progress.progress / progress.total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragging 
            ? "border-[var(--accent)] bg-[var(--accent)]/5" 
            : "border-[var(--border)] hover:border-[var(--accent)]/50"
          }
          ${uploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="text-4xl mb-3">📄</div>
        <div className="font-medium">
          {uploading ? "Uploading..." : "Drop PDF here or click to upload"}
        </div>
        <div className="text-sm text-[var(--text-muted)] mt-1">
          Contracts, depositions, briefs, or any legal document
        </div>
      </div>

      {/* Progress */}
      {progress && (
        <div className="border border-[var(--border)] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {progress.status === "complete" ? "✅ " : ""}
              {progress.status === "error" ? "❌ " : ""}
              {progress.message}
            </span>
            {progress.total > 0 && (
              <span className="text-sm text-[var(--text-muted)]">
                {progressPercent}%
              </span>
            )}
          </div>
          
          {progress.total > 0 && progress.status !== "complete" && (
            <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2">
              <div
                className="bg-[var(--accent)] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {progress.error && (
            <div className="text-sm text-red-500 mt-2">{progress.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
