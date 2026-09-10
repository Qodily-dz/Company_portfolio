"use client";

import { useEffect, useState } from "react";
import { adminApi, ApiError, useAdminUser, type AdminUserRecord } from "../api";
import {
  Button,
  Drawer,
  EmptyState,
  Field,
  Icon,
  Loading,
  PageHeader,
  SectionCard,
  StatusBadge,
  fieldCls,
} from "../ui";

const chipCls =
  "inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/70 bg-surface-elevated/40 text-foreground-soft transition-colors hover:border-accent/60 hover:bg-accent/10 hover:text-white";
const chipDangerCls =
  "inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/70 bg-surface-elevated/40 text-foreground-soft transition-colors hover:border-error/50 hover:bg-error/10 hover:text-error";

type Role = "ADMIN" | "EDITOR";

export default function Users() {
  const me = useAdminUser();
  const [rows, setRows] = useState<AdminUserRecord[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<AdminUserRecord | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", password: "", role: "EDITOR" as Role });

  const load = async () => {
    try {
      const r = await adminApi.usersList();
      setError("");
      setRows(r.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load users.");
    }
  };

  useEffect(() => {
    adminApi
      .usersList()
      .then((r) => {
        setError("");
        setRows(r.data);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load users."));
  }, []);

  function openAdd() {
    setEditing(null);
    setDraft({ name: "", email: "", password: "", role: "EDITOR" });
    setShowDrawer(true);
  }

  function openEdit(u: AdminUserRecord) {
    setEditing(u);
    setDraft({ name: u.name, email: u.email, password: "", role: u.role });
    setShowDrawer(true);
  }

  async function save() {
    const name = draft.name.trim();
    const email = draft.email.trim();
    if (!name || !email) {
      setError("Name and email are required.");
      return;
    }
    if (!editing && draft.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (editing && draft.password && draft.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      if (editing) {
        await adminApi.userUpdate(editing.id, {
          name,
          email,
          role: draft.role,
          ...(draft.password ? { password: draft.password } : {}),
        });
      } else {
        await adminApi.userCreate({ name, email, password: draft.password, role: draft.role });
      }
      setShowDrawer(false);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save user.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(u: AdminUserRecord) {
    if (!window.confirm(`Remove "${u.name}"? They will no longer be able to sign in.`)) return;
    try {
      await adminApi.userDelete(u.id);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to remove user.");
    }
  }

  if (!rows && !error) return <Loading label="Loading team..." />;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="System"
        title="Users"
        description="People who can sign in and manage the platform. Editors can edit content; admins also manage users and system settings."
        action={
          <Button onClick={openAdd}>
            <Icon name="plus" /> Add user
          </Button>
        }
      />

      {error && <div className="rounded border border-error/30 bg-error/10 px-4 py-3 text-[12px] text-error">{error}</div>}

      <SectionCard title={`${(rows || []).length} users`}>
        {!rows ? (
          <Loading label="Loading team..." />
        ) : rows.length === 0 ? (
          <EmptyState icon="users" title="No users yet" body="Add the first person who can manage the platform." />
        ) : (
          <div className="divide-y divide-border/60">
            {rows.map((u) => {
              const isSelf = me?.id === u.id;
              return (
                <div key={u.id} className="flex items-center gap-4 px-[19px] py-4">
                  <div className="grid h-[34px] w-[34px] place-items-center rounded-full bg-accent-dim text-[11px] font-bold text-accent-soft">
                    {u.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <strong className="truncate text-[13px] text-foreground">{u.name}</strong>
                      {isSelf && <StatusBadge tone="green">you</StatusBadge>}
                    </div>
                    <span className="block text-[11px] text-muted-more">{u.email}</span>
                  </div>
                  <StatusBadge tone={u.role === "ADMIN" ? "blue" : "gray"}>{u.role.toLowerCase()}</StatusBadge>
                  <span className="hidden text-[11px] text-muted-more sm:block">
                    {new Date(u.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      className={chipCls}
                      onClick={() => openEdit(u)}
                      aria-label={`Edit ${u.name}`}
                      title="Edit user"
                    >
                      <Icon name="settings" className="h-3.5 w-3.5" />
                    </button>
                    {!isSelf && (
                      <button
                        className={chipDangerCls}
                        onClick={() => remove(u)}
                        aria-label={`Remove ${u.name}`}
                        title="Remove user"
                      >
                        <Icon name="close" className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <Drawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        eyebrow={editing ? "Edit user" : "New user"}
        title={editing ? editing.name : "Add team member"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDrawer(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        <Field label="Full name">
          <input
            className={fieldCls}
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="Amina Bensaid"
          />
        </Field>
        <Field label="Email">
          <input
            className={fieldCls}
            value={draft.email}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
            placeholder="amina@qodily.dz"
            autoComplete="off"
          />
        </Field>
        <Field label="Role">
          <select
            className={fieldCls}
            value={draft.role}
            onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value as Role }))}
          >
            <option value="EDITOR">Editor — can edit platform content</option>
            <option value="ADMIN">Admin — full access, including users</option>
          </select>
        </Field>
        <Field
          label={editing ? "New password" : "Password"}
          hint={editing ? "Leave blank to keep current" : "Minimum 8 characters"}
        >
          <input
            className={fieldCls}
            type="password"
            value={draft.password}
            onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Field>
      </Drawer>
    </div>
  );
}