export interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

export const users: User[] = [
  {
    id: "maya-founder",
    name: "Maya",
    avatar: "M",
    bio: "Startup founder, work-life balance struggles",
  },
  {
    id: "david-exec",
    name: "David",
    avatar: "D",
    bio: "VP Engineering, managing burnout",
  },
  {
    id: "sarah-career",
    name: "Sarah",
    avatar: "S",
    bio: "Career transition, building confidence",
  },
  {
    id: "james-parent",
    name: "James",
    avatar: "J",
    bio: "New parent, redefining priorities",
  },
];
