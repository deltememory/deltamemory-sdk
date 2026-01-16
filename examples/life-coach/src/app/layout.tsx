import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life Coach",
  description: "AI life coaching with persistent memory",
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
