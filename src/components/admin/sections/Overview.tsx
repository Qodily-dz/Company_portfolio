"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError, type DashboardData } from "../api";
import { Icon, SectionCard, StatusBadge, Loading, EmptyState, TableShell } from "../ui";

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: number; sub: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center gap-[10px] text-muted">
        <Icon name={icon} className="h-4 w-4 text-accent-soft" />
        <span className="text-[11px]">{label}</span>
      </div>
      <div className="mt-4 text-[28px] font-semibold leading-none tracking-[-0.03em] text-white">
        {value}
      </div>
      <div className="mt-2 text-[11px] text-muted-more">{sub}</div>
    </div>
  );
}

const statusTone: Record<string, "amber" | "gray" | "blue" | "green"> = {
  NEW: "amber",
  CONTACTED: "gray",
  IN_DISCUSSION: "blue",
  CLOSED: "green",
};

export default function Overview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .dashboard()
      .then((r) => setData(r.data))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load dashboard."));
  }, []);

  if (error)
    return (
      <SectionCard title="Workspace dashboard">
        <EmptyState icon="bell" title="Couldn’t load the dashboard" body={error} />
      </SectionCard>
    );

  if (!data) return <Loading label="Loading workspace…" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="folder" label="Projects" value={data.stats.totalProjects} sub="Across the portfolio" />
        <StatCard icon="article" label="Insights" value={data.stats.totalArticles} sub="Published articles" />
        <StatCard icon="mail" label="Contact requests" value={data.stats.totalContacts} sub="All time" />
        <StatCard icon="bell" label="New requests" value={data.stats.newContacts} sub="Waiting for you" />
      </div>

      <SectionCard
        title="Recent requests"
        action={<button className="border-0 bg-transparent text-[11px] text-muted hover:text-white">View all</button>}
      >
        {data.recentContacts.length === 0 ? (
          <EmptyState icon="mail" title="No contact requests yet" body="Submitted leads will appear here." />
        ) : (
          <TableShell headers={["Name", "Email", "Build", "Status", "Received"]}>
            {data.recentContacts.map((c) => (
              <tr key={c.id} className="border-b border-border/60 last:border-0">
                <td className="px-[19px] py-3 text-[12px] text-foreground">{c.name}</td>
                <td className="px-[19px] py-3 text-[12px] text-muted">{c.email}</td>
                <td className="px-[19px] py-3 text-[12px] text-muted">{c.build}</td>
                <td className="px-[19px] py-3">
                  <StatusBadge tone={statusTone[c.status] ?? "gray"}>{c.status}</StatusBadge>
                </td>
                <td className="px-[19px] py-3 text-[12px] text-muted-more">
                  {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </td>
              </tr>
            ))}
          </TableShell>
        )}
      </SectionCard>

      <SectionCard title={`All projects (${data.recentProjects.length})`}>
        {data.recentProjects.length === 0 ? (
          <EmptyState icon="folder" title="No projects yet" body="Create your first project in the Projects area." />
        ) : (
          <TableShell headers={["Project", "Status", "Featured", "Updated"]}>
            {data.recentProjects.map((p) => (
              <tr key={p.id} className="border-b border-border/60 last:border-0">
                <td className="px-[19px] py-3 text-[12px] text-foreground">{p.name}</td>
                <td className="px-[19px] py-3">
                  <StatusBadge tone={p.status === "PUBLISHED" ? "green" : p.status === "IN_PROGRESS" ? "amber" : "gray"}>
                    {p.status}
                  </StatusBadge>
                </td>
                <td className="px-[19px] py-3 text-[12px] text-muted">{p.featured ? "✦ Featured" : "—"}</td>
                <td className="px-[19px] py-3 text-[12px] text-muted-more">
                  {new Date(p.updated).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </TableShell>
        )}
      </SectionCard>
    </div>
  );
}