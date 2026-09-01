import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/Tooltip";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body className="min-h-full bg-background text-foreground">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
