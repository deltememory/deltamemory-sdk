"use client";

import { Student } from "@/lib/students";

interface StudentSelectorProps {
  students: Student[];
  selected: Student | null;
  onSelect: (student: Student) => void;
}

export function StudentSelector({ students, selected, onSelect }: StudentSelectorProps) {
  return (
    <div className="flex gap-2">
      {students.map((student) => (
        <button
          key={student.id}
          onClick={() => onSelect(student)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
            selected?.id === student.id
              ? "border-[var(--accent)] bg-[var(--bg-secondary)]"
              : "border-[var(--border)] hover:border-[var(--text-muted)]"
          }`}
        >
          <span className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-sm font-medium">
            {student.avatar}
          </span>
          <div className="text-left">
            <div className="text-sm font-medium">{student.name}</div>
            <div className="text-xs text-[var(--text-muted)]">{student.level}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
