import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Control Center — Qodily-dz",
  description: "Qodily-dz internal content and operations dashboard.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
