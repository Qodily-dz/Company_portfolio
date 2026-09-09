"use client";

import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import type { AdminSection } from "./data";
import type { AdminUser } from "./api";
import { Icon } from "./ui";

const navGroups = [
  {
    label: "Workspace",
    items: [
      ["dashboard", "Dashboard", "grid"],
      ["projects", "Projects", "folder"],
      ["case-studies", "Case studies", "layers"],
      ["services", "Services", "layers"],
      ["insights", "Insights", "article"],
    ] as const,
  },
  {
    label: "Relationships",
    items: [
      ["media", "Media library", "image"],
      ["messages", "Contact requests", "mail"],
    ] as const,
  },
  {
    label: "Website",
    items: [
      ["website", "Website content", "globe"],
      ["navigation", "Navigation", "layers"],
      ["seo", "SEO", "search"],
    ] as const,
  },
] as const;

export function AdminShell({
  active,
  onNavigate,
  collapsed,
  onToggle,
  newContacts,
  user,
  onLogout,
  children,
}: {
  active: AdminSection;
  onNavigate: (section: AdminSection) => void;
  collapsed: boolean;
  onToggle: () => void;
  newContacts?: number;
  user: AdminUser | null;
  onLogout: () => void;
  children: ReactNode;
}) {
  return (
    <div className={`flex min-h-screen ${collapsed ? "admin-collapsed" : ""}`}>
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-[74px]" : "w-64"
        } flex-none border-r border-border bg-secondary flex flex-col transition-[width] duration-200 overflow-hidden`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-border px-[19px]">
          <Logo showWordmark={!collapsed} markClassName="text-white h-[23px] w-auto" />
          <button
            onClick={onToggle}
            className="inline-flex h-6 w-6 items-center justify-center rounded bg-transparent text-muted hover:text-white"
            aria-label="Toggle sidebar"
          >
            <Icon name="menu" className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="flex-1 overflow-auto py-6 px-3">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-6">
              {!collapsed && (
                <div className="mb-1.5 h-[21px] px-3 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-more">
                  {group.label}
                </div>
              )}
              {group.items.map(([id, label, icon]) => (
                <button
                  key={id}
                  onClick={() => onNavigate(id as AdminSection)}
                  title={collapsed ? label : undefined}
                  className={`w-full flex items-center gap-3 h-10 rounded-lg border-0 bg-transparent px-3 text-left text-[13px] transition-colors duration-150 ${
                    active === id
                      ? "bg-accent/10 text-accent-soft shadow-[inset_2px_0_0_var(--accent-soft,#2B5C91)]"
                      : "text-muted hover:bg-white/[.04] hover:text-white"
                  }`}
                >
                  <Icon name={icon} />
                  {!collapsed && <span>{label}</span>}
                  {!collapsed && id === "messages" && (newContacts ?? 0) > 0 && (
                    <b className="ml-auto rounded-full bg-accent-dim px-1.5 py-0.5 text-[10px] font-medium text-accent-soft">
                      {newContacts}
                    </b>
                  )}
                </button>
              ))}
            </div>
          ))}

          <div>
            {!collapsed && (
              <div className="mb-1.5 h-[21px] px-3 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-more">
                System
              </div>
            )}
            <button
              onClick={() => onNavigate("settings")}
              className={`w-full flex items-center gap-3 h-10 rounded-lg border-0 bg-transparent px-3 text-left text-[13px] transition-colors duration-150 ${
                active === "settings"
                  ? "bg-accent/10 text-accent-soft shadow-[inset_2px_0_0_var(--accent-soft,#2B5C91)]"
                  : "text-muted hover:bg-white/[.04] hover:text-white"
              }`}
            >
              <Icon name="settings" />
              {!collapsed && <span>Settings</span>}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 border-t border-border px-3.5 py-4 min-w-max">
          <div className="grid h-[30px] w-[30px] place-items-center rounded-full bg-accent-dim text-[10px] font-bold text-accent-soft">
            {(user?.name || "Admin")
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <strong className="block truncate text-xs text-foreground" title={user?.name}>
                {user?.name || "Administrator"}
              </strong>
              <span className="block text-[10px] capitalize text-muted">
                {user?.role?.toLowerCase() || "role"}
              </span>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onLogout}
              className="ml-auto border-0 bg-transparent text-[10px] text-muted hover:text-white"
              title="Sign out"
            >
              <Icon name="arrow" className="h-3 w-3 -scale-x-100" />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-8 gap-5">
          <div className="flex items-center gap-3 text-[13px]">
            <span className="text-muted">Control center</span>
            <span className="text-muted-more">/</span>
            <strong className="text-foreground capitalize">
              {active === "case-studies" ? "Case studies" : active}
            </strong>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="hidden lg:inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-[11px] text-foreground-soft transition-colors hover:border-accent hover:text-white"
              onClick={() => window.open("/", "_blank")}
            >
              <Icon name="globe" className="h-[13px] w-[13px]" />
              Preview website
              <Icon name="arrow" className="h-[13px] w-[13px] text-accent-soft" />
            </button>

            <div className="grid h-8 w-8 place-items-center rounded-full bg-surface text-[11px] font-bold text-foreground">
              {(user?.name || "A")
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1520px] px-11 py-10">{children}</main>
      </div>
    </div>
  );
}