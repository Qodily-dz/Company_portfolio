"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError, type ContactRecord } from "../api";
import { Button, Icon, PageHeader, StatusBadge, SectionCard, Field, Drawer, Loading, EmptyState, TableShell, fieldCls } from "../ui";

const statuses: ContactRecord["status"][] = ["NEW", "CONTACTED", "IN_DISCUSSION", "CLOSED"];
const statusTone: Record<ContactRecord["status"], "amber" | "gray" | "blue" | "green"> = {
  NEW: "amber",
  CONTACTED: "gray",
  IN_DISCUSSION: "blue",
  CLOSED: "green",
};

export default function Messages() {
  const [rows, setRows] = useState<ContactRecord[] | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<ContactRecord | null>(null);
  const [draftStatus, setDraftStatus] = useState<ContactRecord["status"]>("NEW");
  const [notes, setNotes] = useState("");

  const load = async () => {
    try {
      const r = await adminApi.contactsList();
      setError("");
      setRows(r.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load requests.");
    }
  };

  useEffect(() => {
    adminApi
      .contactsList()
      .then((r) => {
        setError("");
        setRows(r.data);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load requests."));
  }, []);

  function open(c: ContactRecord) {
    setSelected(c);
    setDraftStatus(c.status);
    setNotes(c.notes || "");
  }

  async function saveStatus() {
    if (!selected) return;
    try {
      await adminApi.contactSetStatus(selected.id, draftStatus);
      await load();
      setSelected({ ...selected, status: draftStatus });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update status.");
    }
  }

  async function saveNotes() {
    if (!selected) return;
    try {
      await adminApi.contactSetNotes(selected.id, notes);
      await load();
      setSelected({ ...selected, notes });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save notes.");
    }
  }

  async function remove(c: ContactRecord) {
    if (!window.confirm(`Delete request from “${c.name}”? This cannot be undone.`)) return;
    try {
      await adminApi.contactDelete(c.id);
      if (selected?.id === c.id) setSelected(null);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete request.");
    }
  }

  if (!rows && !error) return <Loading label="Loading requests…" />;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Inbox"
        title="Contact requests"
        description="Every submission from the contact flow, with your follow-up status and private notes."
      />

      {error && <div className="rounded border border-error/30 bg-error/10 px-4 py-3 text-[12px] text-error">{error}</div>}

      <SectionCard title={`${rows?.length ?? 0} requests`}>
        {!rows ? (
          <EmptyState icon="mail" title="Couldn’t load requests" body="Try again in a moment." />
        ) : rows.length === 0 ? (
          <EmptyState icon="mail" title="No contact requests" body="Submitted leads will appear here." />
        ) : (
          <TableShell headers={["From", "Build", "Objective", "Status", "Received", ""]}>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-white/[.02]">
                <td className="px-[19px] py-3">
                  <button className="text-left" onClick={() => open(c)}>
                    <span className="block text-[12px] font-medium text-foreground">{c.name}</span>
                    <span className="block text-[10px] text-muted-more">{c.email}</span>
                  </button>
                </td>
                <td className="px-[19px] py-3 text-[12px] text-muted">{c.build}</td>
                <td className="max-w-[260px] truncate px-[19px] py-3 text-[12px] text-muted">{c.objective}</td>
                <td className="px-[19px] py-3">
                  <StatusBadge tone={statusTone[c.status]}>{c.status}</StatusBadge>
                </td>
                <td className="px-[19px] py-3 text-[12px] text-muted-more">
                  {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-[19px] py-3">
                  <button className="border-0 bg-transparent p-1 text-muted hover:text-error" onClick={() => remove(c)} aria-label="Delete">
                    <Icon name="close" className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </TableShell>
        )}
      </SectionCard>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        eyebrow="Contact request"
        title={selected?.name || ""}
      >
        {selected && (
          <>
            <div className="flex items-center gap-2">
              <select className={fieldCls} value={draftStatus} onChange={(e) => setDraftStatus(e.target.value as ContactRecord["status"])}>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <Button className="h-[34px]" onClick={saveStatus}>Apply</Button>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded border border-border p-4 text-[12px]">
              <div><dt className="text-[10px] uppercase tracking-wider text-muted-more">Email</dt><dd className="mt-0.5 text-foreground">{selected.email}</dd></div>
              <div><dt className="text-[10px] uppercase tracking-wider text-muted-more">Phone</dt><dd className="mt-0.5 text-foreground">{selected.phone || "—"}</dd></div>
              <div><dt className="text-[10px] uppercase tracking-wider text-muted-more">Company</dt><dd className="mt-0.5 text-foreground">{selected.company || "—"}</dd></div>
              <div><dt className="text-[10px] uppercase tracking-wider text-muted-more">Country</dt><dd className="mt-0.5 text-foreground">{selected.country || "—"}</dd></div>
              <div><dt className="text-[10px] uppercase tracking-wider text-muted-more">Budget</dt><dd className="mt-0.5 text-foreground">{selected.budget}</dd></div>
              <div><dt className="text-[10px] uppercase tracking-wider text-muted-more">Timeline</dt><dd className="mt-0.5 text-foreground">{selected.timeline}</dd></div>
              <div className="col-span-2"><dt className="text-[10px] uppercase tracking-wider text-muted-more">Needs</dt><dd className="mt-0.5 flex flex-wrap gap-1.5">{selected.needs?.map((n) => <span key={n} className="rounded-full bg-white/[.06] px-2.5 py-1 text-[10px] text-foreground-soft">{n}</span>)}</dd></div>
            </dl>

            <Field label="Objective">
              <p className="rounded border border-border bg-surface px-3 py-3 text-[12px] leading-relaxed text-foreground-soft">{selected.objective}</p>
            </Field>

            {selected.message && (
              <Field label="Message">
                <p className="rounded border border-border bg-surface px-3 py-3 text-[12px] leading-relaxed text-foreground-soft">{selected.message}</p>
              </Field>
            )}

            <Field label="Private notes">
              <textarea rows={5} className={fieldCls} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal follow-up notes…" />
            </Field>
            <div className="flex items-center justify-between">
              <Button variant="secondary" className="h-[34px]" onClick={saveNotes}>Save notes</Button>
              <Button variant="ghost" className="h-[34px] text-error hover:bg-error/10" onClick={() => remove(selected)}>Delete request</Button>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}