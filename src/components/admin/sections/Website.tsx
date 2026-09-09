"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError } from "../api";
import { Button, PageHeader, SectionCard, Field, Loading, fieldCls } from "../ui";

type Config = {
  name?: string;
  legal_name?: string;
  tagline?: string;
  positioning?: string;
  description?: string;
  url?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address_city?: string;
  address_country?: string;
  default_language?: string;
  social?: Record<string, string>;
};

export default function Website() {
  const [draft, setDraft] = useState<Config | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi
      .configGet()
      .then((r) => {
        setError("");
        setDraft(r.data as unknown as Config);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load website content."));
  }, []);

  function set(field: keyof Config, value: string) {
    setDraft((d) => (d ? { ...d, [field]: value } : d));
  }

  async function save() {
    if (!draft) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await adminApi.configUpdate({
        name: draft.name,
        legalName: draft.legal_name,
        tagline: draft.tagline,
        positioning: draft.positioning,
        description: draft.description,
        url: draft.url,
        email: draft.email,
        phone: draft.phone,
        whatsapp: draft.whatsapp,
        addressCity: draft.address_city,
        addressCountry: draft.address_country,
        defaultLanguage: draft.default_language,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save website content.");
    } finally {
      setBusy(false);
    }
  }

  if (!draft && !error) return <Loading label="Loading website content…" />;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Content"
        title="Website content"
        description="The global facts and contact details that show up across the site."
        action={<Button onClick={save} disabled={busy}>{busy ? "Saving…" : saved ? "Saved ✓" : "Save changes"}</Button>}
      />

      {error && <div className="rounded border border-error/30 bg-error/10 px-4 py-3 text-[12px] text-error">{error}</div>}

      {draft && (
        <>
          <SectionCard title="Identity">
            <div className="grid grid-cols-1 gap-4 p-[19px] sm:grid-cols-2">
              <Field label="Studio name">
                <input className={fieldCls} value={draft.name || ""} onChange={(e) => set("name", e.target.value)} />
              </Field>
              <Field label="Legal name">
                <input className={fieldCls} value={draft.legal_name || ""} onChange={(e) => set("legal_name", e.target.value)} />
              </Field>
              <Field label="Tagline">
                <input className={fieldCls} value={draft.tagline || ""} onChange={(e) => set("tagline", e.target.value)} />
              </Field>
              <Field label="Positioning">
                <input className={fieldCls} value={draft.positioning || ""} onChange={(e) => set("positioning", e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="About / mission">
                  <textarea rows={4} className={fieldCls} value={draft.description || ""} onChange={(e) => set("description", e.target.value)} />
                </Field>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Contact & location">
            <div className="grid grid-cols-1 gap-4 p-[19px] sm:grid-cols-2">
              <Field label="Website URL">
                <input className={fieldCls} value={draft.url || ""} onChange={(e) => set("url", e.target.value)} />
              </Field>
              <Field label="Email">
                <input className={fieldCls} value={draft.email || ""} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label="Phone">
                <input className={fieldCls} value={draft.phone || ""} onChange={(e) => set("phone", e.target.value)} />
              </Field>
              <Field label="WhatsApp">
                <input className={fieldCls} value={draft.whatsapp || ""} onChange={(e) => set("whatsapp", e.target.value)} />
              </Field>
              <Field label="City">
                <input className={fieldCls} value={draft.address_city || ""} onChange={(e) => set("address_city", e.target.value)} />
              </Field>
              <Field label="Country">
                <input className={fieldCls} value={draft.address_country || ""} onChange={(e) => set("address_country", e.target.value)} />
              </Field>
              <Field label="Default language">
                <select className={fieldCls} value={draft.default_language || "en"} onChange={(e) => set("default_language", e.target.value)}>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                </select>
              </Field>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}