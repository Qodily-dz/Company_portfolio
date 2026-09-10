"use client";

import { useSyncExternalStore } from "react";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR";
};

export type GalleryImage = {
  url: string;
  alt: string;
  caption: string;
};

export type ProjectTranslation = {
  title: string;
  category: string;
  short: string;
  summary: string;
  problem: string;
  solution: string;
  approach: string;
  architecture: string;
  design: string;
  product: string;
  outcome: string;
};

export type ProjectRecord = {
  id: string;
  slug: string;
  status: "DRAFT" | "IN_PROGRESS" | "PUBLISHED";
  featured: boolean;
  order: number;
  client: string;
  accentA: string;
  accentB: string;
  span: string;
  technologies: string[];
  gallery: GalleryImage[];
  translations: Record<string, Partial<ProjectTranslation>>;
};

export type ArticleRecord = {
  id: string;
  slug: string;
  category: string;
  date: string;
  readTime: string;
  status: "DRAFT" | "PUBLISHED";
  translations: Record<string, { title: string; summary: string; body: string[]; keywords: string[] }>;
};

export type ContactRecord = {
  id: string;
  build: string;
  objective: string;
  needs: string[];
  budget: string;
  timeline: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  message: string | null;
  status: "NEW" | "CONTACTED" | "IN_DISCUSSION" | "CLOSED";
  notes: string | null;
  created_at: string;
};

export type PackRecord = {
  id: string;
  name: string;
  price: number | null;
  priceLabel: string;
  currency: string;
  period: string;
  featured: boolean;
  order: number;
  translations: Record<string, { name: string; description: string; deliverables: string[] }>;
};

export type MediaRecord = {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  created_at: string;
};

export type NavItemRecord = {
  id: string;
  label: string;
  href: string;
  location: string;
  visible: boolean;
  order: number;
};

export type DashboardData = {
  stats: {
    totalProjects: number;
    totalArticles: number;
    totalContacts: number;
    newContacts: number;
  };
  recentContacts: Pick<ContactRecord, "id" | "name" | "email" | "build" | "status" | "created_at">[];
  recentProjects: { id: string; name: string; status: string; featured: boolean; updated: string }[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const TOKEN_KEY = "qodily-admin:token";
const USER_KEY = "qodily-admin:user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function storeSession(token: string | null, user: AdminUser | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("qodily:auth-change"));
  evictAll();
}

function subscribeAuth(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("qodily:auth-change", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("qodily:auth-change", onStoreChange);
  };
}

function getAuthSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USER_KEY);
}

function getAuthServerSnapshot(): string | null {
  return null;
}

export function useAdminUser(): AdminUser | null {
  const raw = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthServerSnapshot);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export class ApiError extends Error {}

// ── Request cache & dedupe ──────────────────────────────
// Identical GETs share one in-flight promise and reuse the result
// for a short TTL, so switching sections / StrictMode double-effects
// don't hammer the API. Mutations evict their collection's cache.
const GET_TTL = 15_000;
const cache = new Map<string, { ts: number; promise: Promise<unknown> }>();

function evictAll() {
  cache.clear();
}

function evictPrefix(path: string) {
  // `/api/admin/projects/abc/featured` → `/api/admin/projects`
  const prefix = path.split("?")[0].split("/").slice(0, 4).join("/");
  for (const key of cache.keys()) {
    if (key.includes(prefix)) cache.delete(key);
  }
}

function doFetch<T>(path: string, options: { method?: string; body?: unknown }): Promise<T> {
  const token = getStoredToken();
  return fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  }).then(async (res) => {
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      const msg =
        typeof payload?.error === "string"
          ? payload.error
          : payload?.error
          ? JSON.stringify(payload.error)
          : `Request failed (${res.status})`;
      if (res.status === 401) {
        storeSession(null, null);
        evictAll();
      }
      throw new ApiError(msg);
    }
    return payload as T;
  });
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const method = options.method || "GET";

  if (method === "GET") {
    const key = `GET:${path}`;
    const hit = cache.get(key);
    if (hit && hit.ts + GET_TTL > Date.now()) {
      return hit.promise as Promise<T>;
    }
    const pending = doFetch<T>(path, options);
    cache.set(key, { ts: Date.now(), promise: pending });
    pending.catch(() => cache.delete(key));
    return pending;
  }

  const result = await doFetch<T>(path, options);
  evictPrefix(path);
  return result;
}

export const adminApi = {
  async login(email: string, password: string) {
    const data = await request<{ user: AdminUser; token: string }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    storeSession(data.token, data.user);
    return data.user;
  },

  async logout() {
    storeSession(null, null);
    await request("/api/auth/logout", { method: "POST" }).catch(() => {});
  },

  dashboard: () => request<{ data: DashboardData }>("/api/admin/dashboard"),

  projectsList: () => request<{ data: ProjectRecord[] }>("/api/admin/projects"),
  projectGet: (id: string) => request<{ data: ProjectRecord }>(`/api/admin/projects/${id}`),
  projectCreate: (body: unknown) => request<{ data: ProjectRecord }>("/api/admin/projects", { method: "POST", body }),
  projectUpdate: (id: string, body: unknown) => request<{ message: string }>(`/api/admin/projects/${id}`, { method: "PUT", body }),
  projectDelete: (id: string) => request<{ message: string }>(`/api/admin/projects/${id}`, { method: "DELETE" }),
  projectSetFeatured: (id: string, featured: boolean) =>
    request<{ message: string }>(`/api/admin/projects/${id}/featured`, { method: "PATCH", body: { featured } }),

  articlesList: () => request<{ data: ArticleRecord[] }>("/api/admin/articles"),
  articleGet: (id: string) => request<{ data: ArticleRecord }>(`/api/admin/articles/${id}`),
  articleCreate: (body: unknown) => request<{ data: ArticleRecord }>("/api/admin/articles", { method: "POST", body }),
  articleUpdate: (id: string, body: unknown) => request<{ message: string }>(`/api/admin/articles/${id}`, { method: "PUT", body }),
  articleDelete: (id: string) => request<{ message: string }>(`/api/admin/articles/${id}`, { method: "DELETE" }),

  contactsList: () => request<{ data: ContactRecord[] }>("/api/admin/contacts"),
  contactGet: (id: string) => request<{ data: ContactRecord }>(`/api/admin/contacts/${id}`),
  contactDelete: (id: string) => request<{ message: string }>(`/api/admin/contacts/${id}`, { method: "DELETE" }),
  contactSetStatus: (id: string, status: ContactRecord["status"]) =>
    request<{ message: string }>(`/api/admin/contacts/${id}/status`, { method: "PATCH", body: { status } }),
  contactSetNotes: (id: string, notes: string) =>
    request<{ message: string }>(`/api/admin/contacts/${id}/notes`, { method: "PATCH", body: { notes } }),

  packsList: () => request<{ data: PackRecord[] }>("/api/admin/packs"),
  packGet: (id: string) => request<{ data: PackRecord }>(`/api/admin/packs/${id}`),
  packCreate: (body: unknown) => request<{ data: PackRecord }>("/api/admin/packs", { method: "POST", body }),
  packUpdate: (id: string, body: unknown) => request<{ message: string }>(`/api/admin/packs/${id}`, { method: "PUT", body }),
  packDelete: (id: string) => request<{ message: string }>(`/api/admin/packs/${id}`, { method: "DELETE" }),

  mediaList: () => request<{ data: MediaRecord[] }>("/api/admin/media"),
  mediaGet: (id: string) => request<{ data: MediaRecord }>(`/api/admin/media/${id}`),
  mediaCreate: (body: unknown) => request<{ data: MediaRecord }>("/api/admin/media", { method: "POST", body }),
  mediaUpdate: (id: string, body: unknown) => request<{ data: MediaRecord }>(`/api/admin/media/${id}`, { method: "PUT", body }),
  mediaDelete: (id: string) => request<{ message: string }>(`/api/admin/media/${id}`, { method: "DELETE" }),

  configGet: () => request<{ data: Record<string, unknown> }>("/api/admin/config"),
  configUpdate: (body: unknown) => request<{ message: string }>("/api/admin/config", { method: "PUT", body }),

  navigationList: () => request<{ data: NavItemRecord[] }>("/api/admin/navigation"),
  navigationGet: (id: string) => request<{ data: NavItemRecord }>(`/api/admin/navigation/${id}`),
  navigationCreate: (body: unknown) => request<{ data: NavItemRecord }>("/api/admin/navigation", { method: "POST", body }),
  navigationUpdate: (id: string, body: unknown) =>
    request<{ message: string }>(`/api/admin/navigation/${id}`, { method: "PUT", body }),
  navigationDelete: (id: string) => request<{ message: string }>(`/api/admin/navigation/${id}`, { method: "DELETE" }),

  seoList: () => request<{ data: Record<string, unknown>[] }>("/api/admin/seo"),
  seoUpdate: (settings: unknown) => request<{ message: string }>("/api/admin/seo", { method: "PUT", body: { settings } }),

  servicesGet: () => request<{ data: Record<string, unknown>[] }>("/api/admin/services"),
  serviceGet: (id: string) => request<{ data: Record<string, unknown> }>(`/api/admin/services/${id}`),
  serviceCreate: (body: unknown) => request<{ data: Record<string, unknown> }>("/api/admin/services", { method: "POST", body }),
  serviceUpdate: (id: string, body: unknown) => request<{ message: string }>(`/api/admin/services/${id}`, { method: "PUT", body }),
  serviceDelete: (id: string) => request<{ message: string }>(`/api/admin/services/${id}`, { method: "DELETE" }),
  pillarCreate: (body: unknown) => request<{ data: Record<string, unknown> }>("/api/admin/pillars", { method: "POST", body }),
  pillarUpdate: (id: string, body: unknown) => request<{ message: string }>(`/api/admin/pillars/${id}`, { method: "PUT", body }),
  pillarDelete: (id: string) => request<{ message: string }>(`/api/admin/pillars/${id}`, { method: "DELETE" }),
};