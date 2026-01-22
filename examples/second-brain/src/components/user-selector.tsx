"use client";

import { users, User } from "@/lib/users";

interface UserSelectorProps {
  currentUser: User;
  onUserChange: (user: User) => void;
}

export function UserSelector({ currentUser, onUserChange }: UserSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[var(--muted)]">User:</span>
      <div className="flex gap-1">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onUserChange(user)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              currentUser.id === user.id
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--card)] hover:bg-[var(--border)] text-[var(--foreground)]"
            }`}
          >
            {user.avatar} {user.name}
          </button>
        ))}
      </div>
    </div>
  );
}
