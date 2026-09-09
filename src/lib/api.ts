const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = {
  get: async <T>(path: string, params?: Record<string, string>) => {
    const query = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    const res = await fetch(`${API_URL}${path}${query}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`GET ${path} failed`);
    return res.json() as Promise<{ data: T }>;
  },
  post: async <T>(path: string, body: unknown, token?: string) => {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error || `POST ${path} failed`);
    }
    return res.json() as Promise<{ data: T }>;
  },
};