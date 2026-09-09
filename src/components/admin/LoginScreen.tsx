"use client";

import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { adminApi, ApiError, storeSession } from "./api";

export function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await adminApi.login(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in. Is the server running?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <form
        onSubmit={submit}
        className="w-full max-w-[360px] rounded-2xl border border-border bg-secondary p-[30px]"
      >
        <Logo markClassName="h-8 w-auto text-white" />

        <h1 className="mt-7 text-lg font-semibold tracking-[-0.02em] text-white">
          Qodily workspace
        </h1>
        <p className="mt-1 text-[13px] text-foreground-soft">
          Sign in to manage your portfolio content.
        </p>

        <label className="mt-7 flex flex-col gap-2 text-[12px] text-foreground-soft">
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-border bg-background px-3 py-[11px] text-[13px] text-white outline-none placeholder:text-muted-more focus:border-accent"
            placeholder="admin@qodily.dz"
          />
        </label>

        <label className="mt-4 flex flex-col gap-2 text-[12px] text-foreground-soft">
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-border bg-background px-3 py-[11px] text-[13px] text-white outline-none placeholder:text-muted-more focus:border-accent"
            placeholder="••••••••"
          />
        </label>

        {error && (
          <p className="mt-4 rounded border border-border bg-background px-3 py-2.5 text-[12px] text-muted">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded border border-accent bg-accent/10 px-4 py-3 text-[13px] font-medium text-accent-soft disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

// Re-export for page-level session bootstrapping.
export function bootstrapSession() {
  if (typeof window === "undefined") return;
  const token = window.localStorage.getItem("qodily-admin:token");
  if (!token) storeSession(null, null);
}