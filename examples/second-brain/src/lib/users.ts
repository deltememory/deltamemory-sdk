export interface User {
  id: string;
  name: string;
  avatar: string;
}

export const users: User[] = [
  { id: "alex", name: "Alex", avatar: "🧠" },
  { id: "sam", name: "Sam", avatar: "💡" },
  { id: "jordan", name: "Jordan", avatar: "📚" },
];
