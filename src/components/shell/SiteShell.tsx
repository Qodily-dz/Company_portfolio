import type { ReactNode } from "react";
import { Header } from "./header/Header";
import { Footer } from "./footer/Footer";
import { CustomCursor } from "@/components/ui/CustomCursor";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* Fixed header spacer so in-page content starts below it. */}
      <div className="h-20 md:h-20" aria-hidden />
      <main id="main" className="flex-1">{children}</main>
      <Footer />
      <CustomCursor />
    </div>
  );
}
