"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi, ApiError, type NavItemRecord } from "../api";
import { Button, Icon, PageHeader, SectionCard, Field, Toggle, Loading, EmptyState, fieldCls } from "../ui";

const LOCATIONS = ["header", "footer"] as const;

export default function Navigation() {
  const [rows, setRows] = useState<NavItemRecord[] | null>(null);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<(typeof LOCATIONS)[number]>("header");
  const [busy, setBusy] = useState(false);
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    try {
      const r = await adminApi.navigationList();
      setError("");
      setRows(r.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load navigation.");
    }
  };

  useEffect(() => {
    adminApi
      .navigationList()
      .then((r) => {
        setError("");
        setRows(r.data);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load navigation."));
  }, []);

  const filtered = useMemo(
    () => (rows || []).filter((n) => n.location === location).sort((a, b) => a.order - b.order),
    [rows, location]
  );

  async function create() {
    if (!label.trim() || !href.trim()) return;
    setBusy(true);
    setError("");
    try {
      await adminApi.navigationCreate({ label: label.trim(), href: href.trim(), location, order: filtered.length });
      setLabel("");
      setHref("");
      setShowAdd(false);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to add link.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(n: NavItemRecord, visible: boolean) {
    try {
      await adminApi.navigationUpdate(n.id, { label: n.label, href: n.href, location: n.location, visible, order: n.order });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update link.");
    }
  }

  async function remove(n: NavItemRecord) {
    if (!window.confirm(`Remove “${n.label}”?`)) return;
    try {
      await adminApi.navigationDelete(n.id);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to remove link.");
    }
  }

  if (!rows && !error) return <Loading label="Loading navigation…" />;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Menus"
        title="Navigation"
        description="Header and footer links. Order follows the numbered position."
        action={
          <Button onClick={() => setShowAdd((v) => !v)}>
            <Icon name="plus" /> {showAdd ? "Close" : "Add link"}
          </Button>
        }
      />

      {error && <div className="rounded border border-error/30 bg-error/10 px-4 py-3 text-[12px] text-error">{error}</div>}

      <div className="flex gap-1.5">
        {LOCATIONS.map((loc) => (
          <button
            key={loc}
            className={`rounded-full border px-3.5 py-2 text-[11px] ${location === loc ? "border-accent bg-accent/10 text-accent-soft" : "border-border bg-transparent text-muted hover:text-white"}`}
            onClick={() => setLocation(loc)}
          >
            {loc}
          </button>
        ))}
      </div>

      {showAdd && (
        <SectionCard title="Add link">
          <div className="grid grid-cols-1 items-end gap-4 p-[19px] sm:grid-cols-3">
            <Field label="Label">
              <input className={fieldCls} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="About" />
            </Field>
            <Field label="Href">
              <input className={fieldCls} value={href} onChange={(e) => setHref(e.target.value)} placeholder="/about" />
            </Field>
            <Button onClick={create} disabled={busy} className="w-fit">{busy ? "Adding…" : "Add link"}</Button>
          </div>
        </SectionCard>
      )}

      <SectionCard title={`${location} · ${filtered.length} links`}>
        {filtered.length === 0 ? (
          <EmptyState icon="layers" title={`No links in the ${location}`} body="Add the first one above." />
        ) : (
          <div className="divide-y divide-border/60">
            {filtered.map((n) => (
              <div key={n.id} className="flex items-center gap-4 px-[19px] py-3.5">
                <span className="w-8 text-[11px] text-muted-more">#{n.order + 1}</span>
                <div className="min-w-0 flex-1">
                  <strong className="block text-[12px] text-foreground">{n.label}</strong>
                  <span className="block text-[10px] text-muted-more">{n.href}</span>
                </div>
                <Toggle checked={n.visible} onChange={(v) => toggle(n, v)} label={`Toggle ${n.label}`} />
                <button className="border-0 bg-transparent p-1 text-muted hover:text-error" onClick={() => remove(n)} aria-label="Remove">
                  <Icon name="close" className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}