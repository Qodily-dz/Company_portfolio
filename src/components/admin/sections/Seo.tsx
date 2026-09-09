"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi, ApiError } from "../api";
import { Button, PageHeader, SectionCard, Field, Loading, EmptyState, fieldCls } from "../ui";

type SeoRow = { id: string; page_path: string; locale: string; meta_title: string | null; meta_description: string | null; og_image: string | null };

export default function Seo() {
  const [rows, setRows] = useState<SeoRow[] | null>(null);
  const [draft, setDraft] = useState<Record<string, { metaTitle: string; metaDescription: string; ogImage: string }>>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi
      .seoList()
      .then((r) => {
        const data = r.data as unknown as SeoRow[];
        const map: Record<string, { metaTitle: string; metaDescription: string; ogImage: string }> = {};
        for (const s of data) {
          map[`${s.page_path}:${s.locale}`] = {
            metaTitle: s.meta_title || "",
            metaDescription: s.meta_description || "",
            ogImage: s.og_image || "",
          };
        }
        setError("");
        setRows(data);
        setDraft(map);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load SEO settings."));
  }, []);

  const groups = useMemo(() => {
    const m = new Map<string, SeoRow[]>();
    for (const s of rows || []) {
      m.set(s.page_path, [...(m.get(s.page_path) || []), s]);
    }
    return [...m.entries()];
  }, [rows]);

  function setField(pagePath: string, locale: string, field: "metaTitle" | "metaDescription" | "ogImage", value: string) {
    setDraft((d) => {
      const key = `${pagePath}:${locale}`;
      return { ...d, [key]: { ...(d?.[key] || { metaTitle: "", metaDescription: "", ogImage: "" }), [field]: value } };
    });
  }

  async function save() {
    if (!draft) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const settings = Object.entries(draft).map(([key, v]) => {
        const [pagePath, locale] = key.split(":");
        return { pagePath, locale, metaTitle: v.metaTitle, metaDescription: v.metaDescription, ogImage: v.ogImage };
      });
      await adminApi.seoUpdate(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save SEO settings.");
    } finally {
      setBusy(false);
    }
  }

  if (!rows && !error) return <Loading label="Loading SEO settings…" />;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Discovery"
        title="SEO"
        description="Meta titles and descriptions per page and language."
        action={<Button onClick={save} disabled={busy}>{busy ? "Saving…" : saved ? "Saved ✓" : "Save changes"}</Button>}
      />

      {error && <div className="rounded border border-error/30 bg-error/10 px-4 py-3 text-[12px] text-error">{error}</div>}

      {rows && rows.length === 0 ? (
        <SectionCard title="SEO">
          <EmptyState icon="search" title="No SEO settings" body="Runs handle navigation and page structure." />
        </SectionCard>
      ) : (
        groups.map(([pagePath, items]) => (
          <SectionCard key={pagePath} title={pagePath} action={<span className="text-[10px] text-muted-more">{items.length} locales</span>}>
            <div className="grid grid-cols-1 gap-5 p-[19px] lg:grid-cols-3">
              {items.map((s) => (
                <div key={`${pagePath}:${s.locale}`} className="flex flex-col gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent-soft">{s.locale}</span>
                  <Field label="Meta title">
                    <input className={fieldCls} value={draft?.[`${pagePath}:${s.locale}`]?.metaTitle || ""} onChange={(e) => setField(pagePath, s.locale, "metaTitle", e.target.value)} />
                  </Field>
                  <Field label="Meta description">
                    <textarea rows={4} className={fieldCls} value={draft?.[`${pagePath}:${s.locale}`]?.metaDescription || ""} onChange={(e) => setField(pagePath, s.locale, "metaDescription", e.target.value)} />
                  </Field>
                  <Field label="OG image">
                    <input className={fieldCls} value={draft?.[`${pagePath}:${s.locale}`]?.ogImage || ""} onChange={(e) => setField(pagePath, s.locale, "ogImage", e.target.value)} placeholder="https://…/og.png" />
                  </Field>
                </div>
              ))}
            </div>
          </SectionCard>
        ))
      )}
    </div>
  );
}