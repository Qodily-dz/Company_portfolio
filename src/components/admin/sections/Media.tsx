"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError, type MediaRecord } from "../api";
import { Button, Icon, PageHeader, SectionCard, Field, Loading, EmptyState, fieldCls } from "../ui";

function formatBytes(n: number) {
  if (!n || n <= 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Media() {
  const [rows, setRows] = useState<MediaRecord[] | null>(null);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("image");
  const [size, setSize] = useState(0);
  const [copied, setCopied] = useState("");

  const load = async () => {
    try {
      const r = await adminApi.mediaList();
      setError("");
      setRows(r.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load media library.");
    }
  };

  useEffect(() => {
    adminApi
      .mediaList()
      .then((r) => {
        setError("");
        setRows(r.data);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load media library."));
  }, []);

  async function add() {
    if (!name.trim() || !url.trim()) return;
    setError("");
    try {
      await adminApi.mediaCreate({ name: name.trim(), url: url.trim(), type: type.trim(), size });
      setName("");
      setUrl("");
      setSize(0);
      setShowAdd(false);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to add asset.");
    }
  }

  async function remove(m: MediaRecord) {
    if (!window.confirm(`Delete “${m.name}”? This does not delete the hosted file.`)) return;
    try {
      await adminApi.mediaDelete(m.id);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete asset.");
    }
  }

  async function copyUrl(m: MediaRecord) {
    try {
      await navigator.clipboard.writeText(m.url);
      setCopied(m.id);
      setTimeout(() => setCopied(""), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }

  if (!rows && !error) return <Loading label="Loading media library…" />;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Assets"
        title="Media library"
        description="Index the images and files you reference in projects and content."
        action={
          <Button onClick={() => setShowAdd((v) => !v)}>
            <Icon name="plus" /> {showAdd ? "Close" : "Add asset"}
          </Button>
        }
      />

      {error && <div className="rounded border border-error/30 bg-error/10 px-4 py-3 text-[12px] text-error">{error}</div>}

      {showAdd && (
        <SectionCard title="Add asset">
          <div className="grid grid-cols-1 gap-4 p-[19px] sm:grid-cols-2">
            <Field label="Name">
              <input className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="restaurant-dashboard.png" />
            </Field>
            <Field label="URL">
              <input className={fieldCls} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/image.png" />
            </Field>
            <Field label="Type">
              <select className={fieldCls} value={type} onChange={(e) => setType(e.target.value)}>
                <option value="image">image</option>
                <option value="file">file</option>
                <option value="video">video</option>
              </select>
            </Field>
            <Field label="Size (bytes)">
              <input type="number" className={fieldCls} value={size || ""} onChange={(e) => setSize(Number(e.target.value))} placeholder="0" />
            </Field>
            <div className="sm:col-span-2">
              <Button onClick={add}>Add to library</Button>
            </div>
          </div>
        </SectionCard>
      )}

      <SectionCard title={`${rows?.length ?? 0} assets`}>
        {!rows ? (
          <EmptyState icon="image" title="Couldn’t load media" body="Try again in a moment." />
        ) : rows.length === 0 ? (
          <EmptyState icon="image" title="The library is empty" body="Add the files you use across projects and content." />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-[19px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rows.map((m) => (
              <div key={m.id} className="overflow-hidden rounded-lg border border-border bg-background">
                <div className="grid h-[120px] place-items-center bg-surface">
                  {m.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.name} className="h-full w-full object-cover" />
                  ) : (
                    <Icon name="file" className="h-8 w-8 text-muted" />
                  )}
                </div>
                <div className="flex items-center gap-2 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-[11px] text-foreground">{m.name}</strong>
                    <span className="text-[10px] text-muted-more">
                      {m.type} · {formatBytes(m.size)} · {new Date(m.created_at).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  <button className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/70 bg-surface-elevated/40 text-foreground-soft transition-colors hover:border-accent/60 hover:bg-accent/10 hover:text-white" onClick={() => copyUrl(m)} aria-label="Copy URL" title="Copy URL">
                    {copied === m.id ? <Icon name="check" className="h-3.5 w-3.5 text-success" /> : <Icon name="link" className="h-3.5 w-3.5" />}
                  </button>
                  <button className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/70 bg-surface-elevated/40 text-foreground-soft transition-colors hover:border-error/50 hover:bg-error/10 hover:text-error" onClick={() => remove(m)} aria-label="Delete" title="Delete">
                    <Icon name="close" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}