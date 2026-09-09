"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError, type PackRecord } from "../api";
import { Button, Icon, PageHeader, StatusBadge, SectionCard, Field, Toggle, Drawer, Loading, EmptyState, fieldCls } from "../ui";

type PillarService = { id: string; name: string; order: number; translations: { locale: string; name: string }[] };
type PillarRaw = {
  id: string;
  name?: string;
  order?: number;
  translations?: { locale: string; label: string; tagline: string; lede: string }[];
  services?: PillarService[];
};
type Pillar = Omit<PillarRaw, "translations"> & {
  translations: Record<string, { label: string; tagline: string; lede: string }>;
};

const LOCALES = ["en", "fr", "ar"] as const;
type Locale = (typeof LOCALES)[number];
const locLabels: Record<Locale, string> = { en: "English", fr: "Français", ar: "العربية" };

type LocEntry = { name: string; description: string; deliverables: string };

type PackDraft = {
  name: string;
  price: number | null;
  priceLabel: string;
  currency: string;
  period: string;
  featured: boolean;
  order: number;
  locale: Locale;
  locales: Record<Locale, LocEntry>;
};

function toPackDraft(p?: PackRecord): PackDraft {
  return {
    name: p?.name || "",
    price: p?.price ?? null,
    priceLabel: p?.priceLabel || "",
    currency: p?.currency || "$",
    period: p?.period || "one-off",
    featured: p?.featured || false,
    order: p?.order || 0,
    locale: "en",
    locales: {
      en: {
        name: p?.translations?.en?.name || "",
        description: p?.translations?.en?.description || "",
        deliverables: (p?.translations?.en?.deliverables || []).join("\n"),
      },
      fr: {
        name: p?.translations?.fr?.name || "",
        description: p?.translations?.fr?.description || "",
        deliverables: (p?.translations?.fr?.deliverables || []).join("\n"),
      },
      ar: {
        name: p?.translations?.ar?.name || "",
        description: p?.translations?.ar?.description || "",
        deliverables: (p?.translations?.ar?.deliverables || []).join("\n"),
      },
    },
  };
}

function shapePillar(p: PillarRaw): Pillar {
  const arr = p.translations || [];
  const tr = arr.reduce<Record<string, { label: string; tagline: string; lede: string }>>((acc, t) => {
    acc[t.locale] = t;
    return acc;
  }, {});
  return { ...p, translations: tr };
}

export default function Services() {
  const [view, setView] = useState<"capabilities" | "packs">("packs");
  const [pillars, setPillars] = useState<Pillar[] | null>(null);
  const [packs, setPacks] = useState<PackRecord[] | null>(null);
  const [error, setError] = useState("");
  const [packDraft, setPackDraft] = useState<PackDraft | null>(null);
  const [packId, setPackId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [addServiceFor, setAddServiceFor] = useState<string | null>(null);
  const [newServiceName, setNewServiceName] = useState("");

  const loadPillars = async () => {
    try {
      const r = await adminApi.servicesGet();
      setError("");
      setPillars((r.data as unknown as PillarRaw[]).map(shapePillar));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load capabilities.");
    }
  };

  const loadPacks = async () => {
    try {
      const r = await adminApi.packsList();
      setError("");
      setPacks(r.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load service packs.");
    }
  };

  useEffect(() => {
    adminApi
      .servicesGet()
      .then((r) => {
        setError("");
        setPillars((r.data as unknown as PillarRaw[]).map(shapePillar));
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load capabilities."));
    adminApi
      .packsList()
      .then((r) => {
        setError("");
        setPacks(r.data);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load service packs."));
  }, []);

  function setPackBase<V>(field: keyof PackDraft, value: V) {
    setPackDraft((d) => (d ? { ...d, [field]: value } : d));
  }

  function setPackLoc(field: keyof LocEntry, value: string) {
    setPackDraft((d) =>
      d ? { ...d, locales: { ...d.locales, [d.locale]: { ...d.locales[d.locale], [field]: value } } } : d
    );
  }

  async function savePack(id: string | null, draft: PackDraft) {
    setBusy(true);
    setError("");
    try {
      const translations = Object.fromEntries(
        LOCALES.map((loc) => [
          loc,
          {
            name: draft.locales[loc].name,
            description: draft.locales[loc].description,
            deliverables: draft.locales[loc].deliverables.split("\n").map((s) => s.trim()).filter(Boolean),
          },
        ])
      );
      const payload = {
        name: draft.name,
        price: draft.price,
        priceLabel: draft.priceLabel,
        currency: draft.currency,
        period: draft.period,
        featured: draft.featured,
        order: draft.order,
        translations,
      };
      if (id) await adminApi.packUpdate(id, payload);
      else await adminApi.packCreate(payload);
      setPackDraft(null);
      await loadPacks();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save pack.");
    } finally {
      setBusy(false);
    }
  }

  async function removePack(p: PackRecord) {
    if (!window.confirm(`Delete pack “${p.name}”?`)) return;
    try {
      await adminApi.packDelete(p.id);
      await loadPacks();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete pack.");
    }
  }

  async function addService(pillarId: string) {
    if (!newServiceName.trim()) return;
    try {
      await adminApi.serviceCreate({
        pillarId,
        name: newServiceName.trim(),
        order: 0,
        translations: {
          en: { name: newServiceName.trim() },
          fr: { name: newServiceName.trim() },
          ar: { name: newServiceName.trim() },
        },
      });
      setNewServiceName("");
      setAddServiceFor(null);
      await loadPillars();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to add service.");
    }
  }

  async function removeService(serviceId: string) {
    if (!window.confirm("Remove this service?")) return;
    try {
      await adminApi.serviceDelete(serviceId);
      await loadPillars();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to remove service.");
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Offerings"
        title="Services"
        description="Capabilities pillar content and the fixed-price service packs clients can pick."
      />

      {error && <div className="rounded border border-error/30 bg-error/10 px-4 py-3 text-[12px] text-error">{error}</div>}

      <div className="flex gap-1.5">
        <button
          className={`rounded-full border px-3.5 py-2 text-[11px] ${view === "packs" ? "border-accent bg-accent/10 text-accent-soft" : "border-border bg-transparent text-muted hover:text-white"}`}
          onClick={() => setView("packs")}
        >
          Service packs
        </button>
        <button
          className={`rounded-full border px-3.5 py-2 text-[11px] ${view === "capabilities" ? "border-accent bg-accent/10 text-accent-soft" : "border-border bg-transparent text-muted hover:text-white"}`}
          onClick={() => setView("capabilities")}
        >
          Capabilities & pillars
        </button>
      </div>

      {view === "packs" ? (
        <>
          <SectionCard
            title={`${packs?.length ?? 0} plans`}
            action={
              <Button
                onClick={() => {
                  setPackId(null);
                  setPackDraft(toPackDraft());
                }}
                className="h-[34px]"
              >
                <Icon name="plus" className="h-3.5 w-3.5" /> New pack
              </Button>
            }
          >
            {!packs ? (
              <Loading label="Loading service packs…" />
            ) : packs.length === 0 ? (
              <EmptyState icon="layers" title="No service packs" body="Create fixed-price plans clients can pick from." />
            ) : (
              <div className="divide-y divide-border/60">
                {packs.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 px-[19px] py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-foreground">{p.translations?.en?.name || p.name}</span>
                        {p.featured && <StatusBadge tone="blue">Featured</StatusBadge>}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted">
                        {p.price === null ? p.priceLabel || "Custom" : `${p.currency}${p.price}${p.period ? ` / ${p.period}` : ""}`}
                        {" — "}
                        {p.translations?.en?.description || "Untitled"}
                      </div>
                    </div>
                    <button
                      className="border-0 bg-transparent p-1 text-muted hover:text-white"
                      onClick={() => {
                        setPackId(p.id);
                        setPackDraft(toPackDraft(p));
                      }}
                      aria-label="Edit"
                    >
                      <Icon name="settings" className="h-4 w-4" />
                    </button>
                    <button className="border-0 bg-transparent p-1 text-muted hover:text-error" onClick={() => removePack(p)} aria-label="Delete">
                      <Icon name="close" className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <Drawer
            open={!!packDraft}
            onClose={() => setPackDraft(null)}
            eyebrow="Service pack"
            title={packId ? "Edit plan" : "New plan"}
            footer={
              <>
                <Button variant="ghost" onClick={() => setPackDraft(null)}>Cancel</Button>
                <Button onClick={() => packDraft && savePack(packId, packDraft)} disabled={busy}>
                  {busy ? "Saving…" : packId ? "Save changes" : "Create plan"}
                </Button>
              </>
            }
          >
            {packDraft && (
              <>
                <div className="grid grid-cols-2 gap-[14px]">
                  <Field label="Name (base)">
                    <input className={fieldCls} value={packDraft.name} onChange={(e) => setPackBase("name", e.target.value)} />
                  </Field>
                  <Field label="Price" hint="leave blank for custom">
                    <input
                      type="number"
                      className={fieldCls}
                      value={packDraft.price ?? ""}
                      onChange={(e) => setPackBase("price", e.target.value === "" ? null : Number(e.target.value))}
                    />
                  </Field>
                  <Field label="Price label" hint="shown when price is blank">
                    <input className={fieldCls} value={packDraft.priceLabel} onChange={(e) => setPackBase("priceLabel", e.target.value)} placeholder="Custom" />
                  </Field>
                  <Field label="Currency">
                    <input className={fieldCls} value={packDraft.currency} onChange={(e) => setPackBase("currency", e.target.value)} placeholder="$" />
                  </Field>
                  <Field label="Period">
                    <input className={fieldCls} value={packDraft.period} onChange={(e) => setPackBase("period", e.target.value)} placeholder="one-off" />
                  </Field>
                  <Field label="Order">
                    <input type="number" className={fieldCls} value={packDraft.order} onChange={(e) => setPackBase("order", Number(e.target.value))} />
                  </Field>
                  <div className="col-span-2 flex items-center justify-between rounded border border-border px-4 py-3">
                    <span className="text-[12px] text-foreground-soft">Highlight on the services page</span>
                    <Toggle checked={packDraft.featured} onChange={(v) => setPackBase("featured", v)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {LOCALES.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setPackBase("locale", loc)}
                      className={`rounded border px-3 py-1.5 text-left text-[10px] ${packDraft.locale === loc ? "border-accent bg-accent/10 text-accent-soft" : "border-border text-muted"}`}
                    >
                      {locLabels[loc]}
                    </button>
                  ))}
                </div>

                <Field label={`Name (${locLabels[packDraft.locale]})`}>
                  <input className={fieldCls} value={packDraft.locales[packDraft.locale].name} onChange={(e) => setPackLoc("name", e.target.value)} />
                </Field>
                <Field label="Description">
                  <textarea rows={3} className={fieldCls} value={packDraft.locales[packDraft.locale].description} onChange={(e) => setPackLoc("description", e.target.value)} />
                </Field>
                <Field label="Deliverables" hint="one per line">
                  <textarea rows={6} className={fieldCls} value={packDraft.locales[packDraft.locale].deliverables} onChange={(e) => setPackLoc("deliverables", e.target.value)} />
                </Field>
              </>
            )}
          </Drawer>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          {!pillars ? (
            <Loading label="Loading capabilities…" />
          ) : pillars.length === 0 ? (
            <SectionCard title="Capabilities">
              <EmptyState icon="layers" title="No pillars yet" body="Pillars are the top-level service streams." />
            </SectionCard>
          ) : (
            pillars.map((p) => {
              const label = p.translations?.en?.label || p.name || "Pillar";
              const services = (p.services || []).map((s: PillarService) => {
                const tr = (s.translations || []).reduce<Record<string, { name: string }>>((acc, t) => {
                  acc[t.locale] = { name: t.name };
                  return acc;
                }, {});
                return { ...s, translations: tr };
              });

  return (
                <SectionCard key={p.id} title={label} action={<span className="text-[10px] text-muted-more">{services.length} services</span>}>
                  <div className="flex flex-col">
                    {services.length === 0 && <p className="px-[19px] py-4 text-[11px] text-muted-more">No services in this pillar yet.</p>}
                    {services.map((s) => (
                      <div key={s.id} className="flex items-center justify-between border-b border-border/60 px-[19px] py-3 last:border-0">
                        <span className="text-[12px] text-foreground">{s.translations?.en?.name || s.name}</span>
                        <button className="border-0 bg-transparent p-1 text-muted hover:text-error" onClick={() => removeService(s.id)} aria-label="Remove">
                          <Icon name="close" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {addServiceFor === p.id ? (
                      <div className="flex gap-2 border-t border-border px-[19px] py-3">
                        <input
                          className={fieldCls}
                          value={newServiceName}
                          onChange={(e) => setNewServiceName(e.target.value)}
                          placeholder="e.g. CI / CD pipelines"
                          autoFocus
                        />
                        <Button className="h-[34px]" onClick={() => addService(p.id)}>Add</Button>
                        <Button variant="ghost" className="h-[34px]" onClick={() => setAddServiceFor(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <button
                        className="flex items-center gap-2 border-t border-border px-[19px] py-3 text-left text-[11px] text-muted hover:text-white"
                        onClick={() => setAddServiceFor(p.id)}
                      >
                        <Icon name="plus" className="h-3 w-3" /> Add service
                      </button>
                    )}
                  </div>
                </SectionCard>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}