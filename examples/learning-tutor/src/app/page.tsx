"use client";

import { useState, useCallback } from "react";
import { students, Student } from "@/lib/students";
import { AgentType } from "@/lib/agents";
import { StudentSelector } from "@/components/student-selector";
import { AgentSwitcher } from "@/components/agent-switcher";
import { Chat } from "@/components/chat";
import { ToolActivity, ToolCall } from "@/components/tool-activity";
import { StatsPanel } from "@/components/stats-panel";
import { KnowledgeGraph } from "@/components/knowledge-graph";

export default function Home() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentType>("tutor");
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);

  const handleToolCall = useCallback((call: ToolCall) => {
    setToolCalls((prev) => {
      const existing = prev.findIndex((c) => c.id === call.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = call;
        return updated;
      }
      return [...prev, call];
    });
  }, []);

  return (
    <main className="h-screen flex flex-col p-6 max-w-[1400px] mx-auto">
      <header className="mb-4 flex-shrink-0">
        <h1 className="text-xl font-semibold">Learning Tutor</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Multi-agent AI tutor with shared memory — both agents remember your learning journey
        </p>
      </header>

      <section className="mb-4 flex-shrink-0 flex items-center justify-between">
        <StudentSelector
          students={students}
          selected={selectedStudent}
          onSelect={setSelectedStudent}
        />
        {selectedStudent && (
          <AgentSwitcher active={activeAgent} onSwitch={setActiveAgent} />
        )}
      </section>

      {selectedStudent ? (
        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
          <div className="flex flex-col min-h-0">
            <Chat
              student={selectedStudent}
              agent={activeAgent}
              onToolCall={handleToolCall}
            />
          </div>
          <div className="flex flex-col gap-3 min-h-0">
            <div className="flex-shrink-0">
              <StatsPanel student={selectedStudent} />
            </div>
            <div className="flex-shrink-0">
              <ToolActivity calls={toolCalls} />
            </div>
            <div className="flex-1 min-h-0">
              <KnowledgeGraph student={selectedStudent} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 border border-[var(--border)] rounded-lg flex items-center justify-center text-[var(--text-muted)]">
          Select a student to start learning
        </div>
      )}
    </main>
  );
}
