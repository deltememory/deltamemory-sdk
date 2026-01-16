export interface Student {
  id: string;
  name: string;
  avatar: string;
  level: string;
}

export const students: Student[] = [
  {
    id: "alex-beginner",
    name: "Alex",
    avatar: "A",
    level: "Beginner - Learning Python basics",
  },
  {
    id: "sam-intermediate",
    name: "Sam",
    avatar: "S",
    level: "Intermediate - Data structures",
  },
  {
    id: "jordan-advanced",
    name: "Jordan",
    avatar: "J",
    level: "Advanced - System design",
  },
];
