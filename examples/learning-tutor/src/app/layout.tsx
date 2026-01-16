import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learning Tutor",
  description: "Multi-agent AI tutor with shared memory",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
