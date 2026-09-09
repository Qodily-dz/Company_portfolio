import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Control Center — Qodily-dz",
  description: "Qodily-dz internal content and operations dashboard.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
