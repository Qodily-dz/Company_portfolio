"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError } from "../api";
import { PageHeader, SectionCard, Field, Button, Loading, fieldCls } from "../ui";

export default function Settings({ onLogout }: { onLogout: () => void }) {
  const [cfg, setCfg] = useState<{ name?: string; default_language?: string; email?: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .configGet()
      .then((r) => setCfg(r.data as unknown as { name?: string; default_language?: string; email?: string }))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load settings."));
  }, []);

  if (!cfg && !error) return <Loading label="Loading settings…" />;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader eyebrow="System" title="Settings" description="Workspace basics and your signed-in session." />

      {error && <div className="rounded border border-error/30 bg-error/10 px-4 py-3 text-[12px] text-error">{error}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Workspace">
          {cfg && (
            <div className="grid grid-cols-1 gap-4 p-[19px] sm:grid-cols-2 lg:grid-cols-1">
              <Field label="Studio name">
                <input className={fieldCls} value={cfg.name || ""} readOnly />
              </Field>
              <Field label="Default language">
                <input className={fieldCls} value={cfg.default_language || "en"} readOnly />
              </Field>
              <Field label="Contact email">
                <input className={fieldCls} value={cfg.email || ""} readOnly />
              </Field>
            </div>
          )}
        </SectionCard>

        <div className="lg:col-span-2">
          <SectionCard title="Session">
            <div className="flex flex-col gap-5 p-[19px]">
              <p className="text-[12px] leading-relaxed text-muted">
                You’re signed into the Qodily control center. Data is served live from the API and Supabase.
                Any content you save is reflected on the public site immediately.
              </p>
              <div className="flex fle-col gap-3">
                <Button variant="secondary" onClick={() => window.open("/", "_blank")}>
                  Preview website
                </Button>
                <Button variant="danger" onClick={onLogout}>
                  Sign out
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}