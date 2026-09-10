"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError, type ArticleRecord } from "../api";
import { Button, Icon, PageHeader, StatusBadge, SectionCard, Field, Drawer, Loading, EmptyState, TableShell, fieldCls } from "../ui";

const LOCALES = ["en", "fr", "ar"] as const;
type Locale = (typeof LOCALES)[number];
const locLabels: Record<Locale, string> = { en: "English", fr: "Français", ar: "العربية" };
const emptyLoc = { title: "", summary: "", body: "", keywords: "" };

type Draft = {
  slug: string;
  category: string;
  readTime: string;
  status: "DRAFT" | "PUBLISHED";
  locale: Locale;
  locales: Record<Locale, { title: string; summary: string; body: string; keywords: string }>;
};

function blankDraft(): Draft {
  return {
    slug: "",
    category: "SOFTWARE",
    readTime: "4 min read",
    status: "DRAFT",
    locale: "en",
    locales: { en: { ...emptyLoc }, fr: { ...emptyLoc }, ar: { ...emptyLoc } },
  };
}

function toDraft(a?: ArticleRecord): Draft {
  const toLoc = (title: string, summary: string, body?: string[], keywords?: string[]) => ({
    title,
    summary,
    body: Array.isArray(body) ? body.join("\n") : "",
    keywords: Array.isArray(keywords) ? keywords.join(", ") : "",
  });
  return {
    slug: a?.slug || "",
    category: a?.category || "SOFTWARE",
    readTime: a?.readTime || "4 min read",
    status: a?.status || "DRAFT",
    locale: "en",
    locales: {
      en: toLoc(a?.translations?.en?.title || "", a?.translations?.en?.summary || "", a?.translations?.en?.body, a?.translations?.en?.keywords),
      fr: toLoc(a?.translations?.fr?.title || "", a?.translations?.fr?.summary || "", a?.translations?.fr?.body, a?.translations?.fr?.keywords),
      ar: toLoc(a?.translations?.ar?.title || "", a?.translations?.ar?.summary || "", a?.translations?.ar?.body, a?.translations?.ar?.keywords),
    },
  };
}

function buildPayload(d: Draft) {
  const translations = Object.fromEntries(
    LOCALES.map((loc) => [
      loc,
      {
        title: d.locales[loc].title,
        summary: d.locales[loc].summary,
        body: d.locales[loc].body.split("\n").map((s) => s.trim()).filter(Boolean),
        keywords: d.locales[loc].keywords.split(",").map((s) => s.trim()).filter(Boolean),
      },
    ])
  );
  return {
    slug: d.slug,
    category: d.category,
    readTime: d.readTime,
    status: d.status,
    translations,
  };
}

export default function Insights() {
  const [rows, setRows] = useState<ArticleRecord[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const r = await adminApi.articlesList();
      setError("");
      setRows(r.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load articles.");
    }
  };

  useEffect(() => {
    adminApi
      .articlesList()
      .then((r) => {
        setError("");
        setRows(r.data);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load articles."));
  }, []);

  async function save() {
    if (!draft) return;
    setBusy(true);
    setError("");
    try {
      const payload = buildPayload(draft);
      if (editingId) await adminApi.articleUpdate(editingId, payload);
      else await adminApi.articleCreate(payload);
      setDraft(null);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save article.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(a: ArticleRecord) {
    if (!window.confirm(`Delete “${a.translations?.en?.title || a.slug}”?`)) return;
    try {
      await adminApi.articleDelete(a.id);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete article.");
    }
  }

  if (!rows && !error) return <Loading label="Loading insights…" />;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Writing"
        title="Insights"
        description="The articles and research pieces published under Insights."
        action={
          <Button
            onClick={() => {
              setEditingId(null);
              setDraft(blankDraft());
            }}
          >
            <Icon name="plus" /> New article
          </Button>
        }
      />

      {error && <div className="rounded border border-error/30 bg-error/10 px-4 py-3 text-[12px] text-error">{error}</div>}

      <SectionCard title={`${rows?.length ?? 0} articles`}>
        {!rows ? (
          <EmptyState icon="article" title="Couldn’t load articles" body="Try again in a moment." />
        ) : rows.length === 0 ? (
          <EmptyState icon="article" title="No articles yet" body="Publish your first insight." />
        ) : (
          <TableShell headers={["Article", "Category", "Status", ""]}>
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-border/60 last:border-0">
                <td className="px-[19px] py-3">
                  <button className="text-left" onClick={() => { setEditingId(a.id); setDraft(toDraft(a)); }}>
                    <span className="block text-[12px] font-medium text-foreground">{a.translations?.en?.title || a.slug}</span>
                    <span className="block text-[10px] text-muted-more">
                      {new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {a.readTime}
                    </span>
                  </button>
                </td>
                <td className="px-[19px] py-3 text-[12px] text-muted">{a.category}</td>
                <td className="px-[19px] py-3">
                  <StatusBadge tone={a.status === "PUBLISHED" ? "green" : "gray"}>{a.status}</StatusBadge>
                </td>
                <td className="px-[19px] py-3 text-right">
                  <button
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/70 bg-surface-elevated/40 text-foreground-soft transition-colors hover:border-error/50 hover:bg-error/10 hover:text-error"
                    onClick={() => remove(a)}
                    aria-label="Delete"
                  >
                    <Icon name="close" className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </TableShell>
        )}
      </SectionCard>

      {draft && (
        <InsightsEditor
          draft={draft}
          editingId={editingId}
          busy={busy}
          onClose={() => setDraft(null)}
          onSave={save}
          update={(fn) => setDraft((d) => (d ? fn(d) : d))}
        />
      )}
    </div>
  );
}

function InsightsEditor({
  draft,
  editingId,
  busy,
  onClose,
  onSave,
  update,
}: {
  draft: Draft;
  editingId: string | null;
  busy: boolean;
  onClose: () => void;
  onSave: () => void;
  update: (fn: (d: Draft) => Draft) => void;
}) {
  return (
    <Drawer
      open
      onClose={onClose}
      eyebrow="Insight"
      title={editingId ? "Edit article" : "New article"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave} disabled={busy}>
            {busy ? "Saving…" : editingId ? "Save changes" : "Create article"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-[14px]">
        <Field label="Slug">
          <input className={fieldCls} value={draft.slug} onChange={(e) => update((d) => ({ ...d, slug: e.target.value }))} placeholder="the-case-for-simple-software" />
        </Field>
        <Field label="Read time">
          <input className={fieldCls} value={draft.readTime} onChange={(e) => update((d) => ({ ...d, readTime: e.target.value }))} placeholder="4 min read" />
        </Field>
        <Field label="Category">
          <select className={fieldCls} value={draft.category} onChange={(e) => update((d) => ({ ...d, category: e.target.value }))}>
            <option value="TECHNOLOGY">TECHNOLOGY</option>
            <option value="SOFTWARE">SOFTWARE</option>
            <option value="BUSINESS">BUSINESS</option>
            <option value="DESIGN">DESIGN</option>
            <option value="MARKETING">MARKETING</option>
            <option value="DIGITAL_TRANSFORMATION">DIGITAL_TRANSFORMATION</option>
          </select>
        </Field>
        <Field label="Status">
          <select className={fieldCls} value={draft.status} onChange={(e) => update((d) => ({ ...d, status: e.target.value as Draft["status"] }))}>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
          </select>
        </Field>
      </div>

      <div className="flex gap-0.5">
        {LOCALES.map((loc) => (
          <button
            key={loc}
            onClick={() => update((d) => ({ ...d, locale: loc }))}
            className={`rounded border-0 px-2.5 py-1 text-[10px] ${draft.locale === loc ? "bg-accent/15 text-accent-soft" : "bg-transparent text-muted hover:text-white"}`}
          >
            {locLabels[loc]}
          </button>
        ))}
      </div>

      <Field label={`Title (${locLabels[draft.locale]})`}>
        <input
          className={fieldCls}
          value={draft.locales[draft.locale].title}
          onChange={(e) =>
            update((d) => ({ ...d, locales: { ...d.locales, [d.locale]: { ...d.locales[d.locale], title: e.target.value } } }))
          }
        />
      </Field>
      <Field label="Summary">
        <textarea
          rows={3}
          className={fieldCls}
          value={draft.locales[draft.locale].summary}
          onChange={(e) =>
            update((d) => ({ ...d, locales: { ...d.locales, [d.locale]: { ...d.locales[d.locale], summary: e.target.value } } }))
          }
        />
      </Field>
      <Field label="Keywords" hint="comma separated">
        <input
          className={fieldCls}
          value={draft.locales[draft.locale].keywords}
          onChange={(e) =>
            update((d) => ({ ...d, locales: { ...d.locales, [d.locale]: { ...d.locales[d.locale], keywords: e.target.value } } }))
          }
        />
      </Field>
      <Field label="Body" hint="one paragraph per line">
        <textarea
          rows={14}
          className={fieldCls}
          value={draft.locales[draft.locale].body}
          onChange={(e) =>
            update((d) => ({ ...d, locales: { ...d.locales, [d.locale]: { ...d.locales[d.locale], body: e.target.value } } }))
          }
        />
      </Field>
    </Drawer>
  );
}