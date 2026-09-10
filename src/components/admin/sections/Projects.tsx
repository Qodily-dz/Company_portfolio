"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi, ApiError, type ProjectRecord, type GalleryImage, type ProjectTranslation } from "../api";
import {
  Button,
  Icon,
  PageHeader,
  StatusBadge,
  SectionCard,
  Field,
  Toggle,
  Drawer,
  Loading,
  EmptyState,
  TableShell,
  fieldCls,
} from "../ui";

const LOCALES = ["en", "fr", "ar"] as const;
type Locale = (typeof LOCALES)[number];

const emptyLoc: ProjectTranslation = {
  title: "",
  category: "",
  short: "",
  summary: "",
  problem: "",
  solution: "",
  approach: "",
  architecture: "",
  design: "",
  product: "",
  outcome: "",
};

const locLabels: Record<Locale, string> = { en: "English", fr: "Français", ar: "العربية" };

type Draft = {
  slug: string;
  client: string;
  status: "DRAFT" | "IN_PROGRESS" | "PUBLISHED";
  featured: boolean;
  order: number;
  accentA: string;
  accentB: string;
  span: string;
  category: string;
  technologies: string;
  gallery: GalleryImage[];
  locale: Locale;
  locales: Record<Locale, ProjectTranslation>;
};

function blankDraft(): Draft {
  return {
    slug: "",
    client: "",
    status: "DRAFT",
    featured: false,
    order: 0,
    accentA: "#0A5563",
    accentB: "#0E7C8B",
    span: "col-span-1",
    category: "",
    technologies: "",
    gallery: [],
    locale: "en",
    locales: { en: { ...emptyLoc }, fr: { ...emptyLoc }, ar: { ...emptyLoc } },
  };
}

function buildPayload(d: Draft) {
  const translations = Object.fromEntries(
    LOCALES.map((loc) => [loc, { ...d.locales[loc], category: d.category }])
  );
  return {
    slug: d.slug,
    category: d.category,
    short: d.locales.en.short,
    summary: d.locales.en.summary,
    problem: d.locales.en.problem,
    solution: d.locales.en.solution,
    approach: d.locales.en.approach,
    architecture: d.locales.en.architecture,
    design: d.locales.en.design,
    product: d.locales.en.product,
    outcome: d.locales.en.outcome,
    gallery: d.gallery,
    accentA: d.accentA,
    accentB: d.accentB,
    span: d.span,
    client: d.client,
    status: d.status,
    featured: d.featured,
    order: d.order,
    translations,
    technologies: d.technologies.split(",").map((s) => s.trim()).filter(Boolean),
  };
}

const statusTone = { DRAFT: "gray", IN_PROGRESS: "amber", PUBLISHED: "green" } as const;
const caseParts = ["problem", "solution", "design", "architecture", "product", "outcome"] as const;

export default function Projects({ mode }: { mode: "projects" | "case-studies" }) {
  const [rows, setRows] = useState<ProjectRecord[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    try {
      const r = await adminApi.projectsList();
      setError("");
      setRows(r.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load projects.");
    }
  }

  useEffect(() => {
    adminApi
      .projectsList()
      .then((r) => {
        setError("");
        setRows(r.data);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load projects."));
  }, []);

  const completeness = useMemo(() => {
    if (!rows) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const p of rows) {
      const t = p.translations?.en ?? {};
      const filled = caseParts.filter((k) => (t[k as keyof typeof t] || "").toString().trim().length > 0);
      let score = Math.round((filled.length / caseParts.length) * 100);
      if (Array.isArray(p.gallery) && p.gallery.length > 0) score = Math.min(100, score + 5);
      map.set(p.id, score);
    }
    return map;
  }, [rows]);

  function openCreate() {
    setEditingId(null);
    setDraft(blankDraft());
  }

  function openEdit(p: ProjectRecord) {
    setEditingId(p.id);
    const en = p.translations?.en ?? emptyLoc;
    setDraft({
      slug: p.slug,
      client: p.client || "",
      status: p.status,
      featured: p.featured,
      order: p.order,
      accentA: p.accentA,
      accentB: p.accentB,
      span: p.span,
      category: p.translations?.en?.category || "",
      technologies: (p.technologies || []).join(", "),
      gallery: Array.isArray(p.gallery) ? p.gallery : [],
      locale: "en",
      locales: {
        en: { ...emptyLoc, ...en },
        fr: { ...emptyLoc, ...(p.translations?.fr ?? {}) },
        ar: { ...emptyLoc, ...(p.translations?.ar ?? {}) },
      },
    });
  }

  async function save() {
    if (!draft) return;
    setBusy(true);
    setError("");
    try {
      const payload = buildPayload(draft);
      if (editingId) await adminApi.projectUpdate(editingId, payload);
      else await adminApi.projectCreate(payload);
      setDraft(null);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save project.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: ProjectRecord) {
    if (!window.confirm(`Delete “${p.slug}”? This cannot be undone.`)) return;
    try {
      await adminApi.projectDelete(p.id);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete project.");
    }
  }

  function preview(p: ProjectRecord) {
    window.open(`${window.location.origin}/en/work/${p.slug}`, "_blank", "noopener");
  }

  async function toggleFeatured(p: ProjectRecord, next: boolean) {
    try {
      await adminApi.projectSetFeatured(p.id, next);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update.");
    }
  }

  if (!rows) {
    return error ? (
      <SectionCard title={mode === "case-studies" ? "Case studies" : "Projects"}>
        <EmptyState icon="folder" title="Couldn’t load projects" body={error} />
      </SectionCard>
    ) : (
      <Loading label="Loading projects…" />
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow={mode === "case-studies" ? "Case studies" : "Portfolio"}
        title={mode === "case-studies" ? "Project case studies" : "Projects"}
        description={
          mode === "case-studies"
            ? "Each project pairs with a full case study — challenge, solution, design, architecture, product and results."
            : "Manage the work you showcase on the portfolio — content, translations, order and featured picks."
        }
        action={
          <Button onClick={openCreate}>
            <Icon name="plus" />
            {mode === "case-studies" ? "New case study" : "New project"}
          </Button>
        }
      />

      {error && (
        <div className="rounded border border-error/30 bg-error/10 px-4 py-3 text-[12px] text-error">{error}</div>
      )}

      {rows.length === 0 ? (
        <SectionCard title={mode === "case-studies" ? "Case studies" : "Projects"}>
          <EmptyState icon="folder" title="Nothing here yet" body="Create your first project to get started." />
        </SectionCard>
      ) : (
        <SectionCard
          title={`${rows.length} ${rows.length === 1 ? "record" : "records"}`}
          action={
            <button className="border-0 bg-transparent text-[11px] text-muted hover:text-white" onClick={load}>
              Refresh
            </button>
          }
        >
          <TableShell headers={["Project", "Client", "Status", "Featured", "Cases", "Edited"]}>
            {rows.map((p) => {
              const name = p.translations?.en?.title || p.slug;
              return (
                <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-white/[.02]">
                  <td className="px-[19px] py-3">
                    <button className="text-left" onClick={() => openEdit(p)}>
                      <span className="block text-[12px] font-medium text-foreground">{name}</span>
                      <span className="block text-[10px] text-muted-more">{p.slug}</span>
                    </button>
                  </td>
                  <td className="px-[19px] py-3 text-[12px] text-muted">{p.client || "—"}</td>
                  <td className="px-[19px] py-3">
                    <StatusBadge tone={statusTone[p.status]}>{p.status}</StatusBadge>
                  </td>
                  <td className="px-[19px] py-3">
                    <Toggle checked={p.featured} onChange={(v) => toggleFeatured(p, v)} />
                  </td>
                  <td className="px-[19px] py-3">
                    <span className="text-[11px] text-muted">
                      {completeness.get(p.id) ?? 0}%{" "}
                      <span className="text-muted-more">complete</span>
                    </span>
                  </td>
                  <td className="px-[19px] py-3 text-[12px] text-muted-more">—</td>
                  <td className="px-[19px] py-3">
                    <div className="flex gap-1">
                      <button
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/70 bg-surface-elevated/40 text-foreground-soft transition-colors hover:border-accent/60 hover:bg-accent/10 hover:text-white"
                        onClick={() => preview(p)}
                        aria-label="Preview"
                        title="Open on the public site"
                      >
                        <Icon name="eye" className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/70 bg-surface-elevated/40 text-foreground-soft transition-colors hover:border-accent/60 hover:bg-accent/10 hover:text-white"
                        onClick={() => openEdit(p)}
                        aria-label="Edit"
                      >
                        <Icon name="settings" className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/70 bg-surface-elevated/40 text-foreground-soft transition-colors hover:border-error/50 hover:bg-error/10 hover:text-error"
                        onClick={() => remove(p)}
                        aria-label="Delete"
                      >
                        <Icon name="close" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </TableShell>
        </SectionCard>
      )}

      <Drawer
        open={!!draft}
        onClose={() => setDraft(null)}
        eyebrow={mode === "case-studies" ? "Case study" : "Project"}
        title={editingId ? "Edit record" : "New record"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy ? "Saving…" : editingId ? "Save changes" : "Create project"}
            </Button>
          </>
        }
      >
        {draft && (
          <ProjectForm
            draft={draft}
            setDraft={(fn) => setDraft((d) => (d ? fn(d) : d))}
          />
        )}
      </Drawer>
    </div>
  );
}

function ProjectForm({
  draft,
  setDraft,
}: {
  draft: Draft;
  setDraft: (updater: (d: Draft) => Draft) => void;
}) {
  const t = draft.locales[draft.locale];

  function setBase<V>(field: keyof Draft, value: V) {
    setDraft((d) => ({ ...d, [field]: value }));
  }

  function setLoc(field: keyof ProjectTranslation, value: string) {
    setDraft((d) => ({
      ...d,
      locales: { ...d.locales, [d.locale]: { ...d.locales[d.locale], [field]: value } },
    }));
  }

  function setGalleryAt(i: number, patch: Partial<GalleryImage>) {
    setDraft((d) => {
      const gallery = d.gallery.map((g, idx) => (idx === i ? { ...g, ...patch } : g));
      return { ...d, gallery };
    });
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-[14px]">
        <Field label="Slug" hint="lowercase, hyphens">
          <input className={fieldCls} value={draft.slug} onChange={(e) => setBase("slug", e.target.value)} placeholder="restaurant-management" />
        </Field>
        <Field label="Client">
          <input className={fieldCls} value={draft.client} onChange={(e) => setBase("client", e.target.value)} placeholder="Optional" />
        </Field>
        <Field label="Category">
          <input className={fieldCls} value={draft.category} onChange={(e) => setBase("category", e.target.value)} placeholder="Web App" />
        </Field>
        <Field label="Order">
          <input type="number" className={fieldCls} value={draft.order} onChange={(e) => setBase("order", Number(e.target.value))} />
        </Field>
        <Field label="Status">
          <select className={fieldCls} value={draft.status} onChange={(e) => setBase("status", e.target.value)}>
            <option value="DRAFT">DRAFT</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="PUBLISHED">PUBLISHED</option>
          </select>
        </Field>
        <Field label="Highlight colour">
          <div className="flex items-center gap-2">
            <input type="color" className="h-[38px] w-[44px] shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5" value={draft.accentA} onChange={(e) => setBase("accentA", e.target.value)} />
            <input type="color" className="h-[38px] w-[44px] shrink-0 cursor-pointer rounded border border-border bg-transparent p-0.5" value={draft.accentB} onChange={(e) => setBase("accentB", e.target.value)} />
            <input className={fieldCls} value={draft.span} onChange={(e) => setBase("span", e.target.value)} placeholder="span class" />
          </div>
        </Field>
        <div className="col-span-2 flex items-center justify-between rounded border border-border px-4 py-3">
          <span className="text-[12px] text-foreground-soft">Feature on the highlights rail</span>
          <Toggle checked={draft.featured} onChange={(v) => setBase("featured", v)} />
        </div>
      </div>

      <div className="rounded border border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted">Case study</span>
          <div className="flex gap-0.5">
            {LOCALES.map((loc) => (
              <button
                key={loc}
                onClick={() => setDraft((d) => ({ ...d, locale: loc }))}
                className={`rounded border-0 px-2.5 py-1 text-[10px] ${
                  draft.locale === loc ? "bg-accent/15 text-accent-soft" : "bg-transparent text-muted hover:text-white"
                }`}
              >
                {locLabels[loc]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[14px]">
          <Field label={`Title (${locLabels[draft.locale]})`}>
            <input className={fieldCls} value={t.title} onChange={(e) => setLoc("title", e.target.value)} />
          </Field>
          <Field label="Short description">
            <input className={fieldCls} value={t.short} onChange={(e) => setLoc("short", e.target.value)} />
          </Field>
          <Field label="Summary">
            <textarea rows={2} className={fieldCls} value={t.summary} onChange={(e) => setLoc("summary", e.target.value)} />
          </Field>
          <Field label="The challenge">
            <textarea rows={3} className={fieldCls} value={t.problem} onChange={(e) => setLoc("problem", e.target.value)} />
          </Field>
          <Field label="The solution">
            <textarea rows={3} className={fieldCls} value={t.solution} onChange={(e) => setLoc("solution", e.target.value)} />
          </Field>
          <Field label="Design">
            <textarea rows={3} className={fieldCls} value={t.design} onChange={(e) => setLoc("design", e.target.value)} />
          </Field>
          <Field label="Architecture">
            <textarea rows={3} className={fieldCls} value={t.architecture} onChange={(e) => setLoc("architecture", e.target.value)} placeholder="Falls back to approach" />
          </Field>
          <Field label="The product">
            <textarea rows={3} className={fieldCls} value={t.product} onChange={(e) => setLoc("product", e.target.value)} />
          </Field>
          <Field label="Outcome / results">
            <textarea rows={3} className={fieldCls} value={t.outcome} onChange={(e) => setLoc("outcome", e.target.value)} />
          </Field>
          <Field label="Technologies" hint="comma separated">
            <input className={fieldCls} value={draft.technologies} onChange={(e) => setBase("technologies", e.target.value)} placeholder="Next.js, Supabase, TypeScript" />
          </Field>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="h-[30px] rounded-md text-[10px]"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  locales: { ...d.locales, fr: { ...d.locales.en }, ar: { ...d.locales.en } },
                }))
              }
            >
              Copy English → FR / AR
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded border border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted">Product gallery</span>
          <Button
            variant="ghost"
            className="h-[28px] rounded-md text-[10px]"
            onClick={() => setDraft((d) => ({ ...d, gallery: [...d.gallery, { url: "", alt: "", caption: "" }] }))}
          >
            <Icon name="plus" className="h-3 w-3" /> Add image
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {draft.gallery.length === 0 && (
            <p className="text-[11px] text-muted-more">No images yet — add product screenshots or photos.</p>
          )}
          {draft.gallery.map((g, i) => (
            <div key={i} className="flex items-start gap-2">
              {g.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={g.url} alt={g.alt || ""} className="h-[58px] w-[58px] rounded border border-border object-cover" />
              ) : (
                <div className="grid h-[58px] w-[58px] shrink-0 place-items-center rounded border border-border text-muted-more">
                  <Icon name="image" className="h-5 w-5" />
                </div>
              )}
              <div className="grid flex-1 grid-cols-1 gap-2">
                <input className={fieldCls} value={g.url} onChange={(e) => setGalleryAt(i, { url: e.target.value })} placeholder="https://…/image.png" />
                <div className="grid grid-cols-2 gap-2">
                  <input className={fieldCls} value={g.alt} onChange={(e) => setGalleryAt(i, { alt: e.target.value })} placeholder="Alt text" />
                  <input className={fieldCls} value={g.caption} onChange={(e) => setGalleryAt(i, { caption: e.target.value })} placeholder="Caption" />
                </div>
              </div>
              <button
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/70 bg-surface-elevated/40 text-foreground-soft transition-colors hover:border-error/50 hover:bg-error/10 hover:text-error"
                onClick={() => setDraft((d) => ({ ...d, gallery: d.gallery.filter((_, idx) => idx !== i) }))}
                aria-label="Remove image"
              >
                <Icon name="close" className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}