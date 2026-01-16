"use client";

import { AgentType } from "@/lib/agents";

interface AgentSwitcherProps {
  active: AgentType;
  onSwitch: (agent: AgentType) => void;
}

export function AgentSwitcher({ active, onSwitch }: AgentSwitcherProps) {
  return (
    <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg">
      <button
        onClick={() => onSwitch("tutor")}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          active === "tutor"
            ? "bg-[var(--tutor)] text-white"
            : "text-[var(--text-muted)] hover:text-[var(--text)]"
        }`}
      >
        🎓 TutorAgent
      </button>
      <button
        onClick={() => onSwitch("practice")}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          active === "practice"
            ? "bg-[var(--practice)] text-white"
            : "text-[var(--text-muted)] hover:text-[var(--text)]"
        }`}
      >
        💪 PracticeAgent
      </button>
    </div>
  );
}
