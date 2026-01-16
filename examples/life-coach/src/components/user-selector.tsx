"use client";

import { User } from "@/lib/users";

interface UserSelectorProps {
  users: User[];
  selected: User | null;
  onSelect: (user: User) => void;
}

export function UserSelector({ users, selected, onSelect }: UserSelectorProps) {
  return (
    <div className="flex gap-2">
      {users.map((user) => (
        <button
          key={user.id}
          onClick={() => onSelect(user)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
            selected?.id === user.id
              ? "border-[var(--accent)] bg-[var(--bg-secondary)]"
              : "border-[var(--border)] hover:border-[var(--text-muted)]"
          }`}
        >
          <span className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-sm font-medium">
            {user.avatar}
          </span>
          <div className="text-left">
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs text-[var(--text-muted)]">{user.bio}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
