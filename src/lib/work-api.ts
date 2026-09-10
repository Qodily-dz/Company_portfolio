import { api } from "@/lib/api";
import { PROJECTS, type Project } from "@/lib/work";
import type { Locale } from "@/lib/i18n/config";

/**
 * Use cases served by the `server/` API (`GET /api/projects`).
 *
 * The endpoint merges `project_translations` for the requested locale into the
 * row, so the payload already uses the same field names as the bundled
 * `Project` type — id, slug, title, category, summary, technology, accent.
 *
 * Anything that goes wrong (API down, bad shape, empty catalogue) falls back to
 * the bundled PROJECTS so /work always renders. `source` lets the page say
 * which one it used instead of silently pretending the CMS answered.
 */

type ApiProject = Partial<Project> & {
  id?: string;
  slug?: string;
  featured?: boolean;
  client?: string | null;
  technology?: string[];
};

export type UseCaseSource = "api" | "static";

/** In-house lab work is stored with a `client` of "Qodily Lab" / "Qodily". */
function isRealClient(client: string | null | undefined): boolean {
  if (!client) return false;
  return !/^qodily(\s|$)/i.test(client.trim());
}

function toProject(row: ApiProject, i: number): Project {
  const fallback = PROJECTS[i % PROJECTS.length];
  return {
    ...fallback,
    ...row,
    // The card links by id; the API's stable public handle is the slug.
    id: row.slug || row.id || fallback.id,
    title: row.title ?? fallback.title,
    category: row.category ?? fallback.category,
    summary: row.summary ?? fallback.summary,
    technology: row.technology?.length ? row.technology : fallback.technology,
    accent: row.accent ?? fallback.accent,
    // `client` is set to "Qodily Lab" for in-house concepts — a client name
    // only counts as shipped work when it is somebody else's.
    isProduction: row.isProduction ?? isRealClient(row.client),
    badge: row.badge ?? (isRealClient(row.client) ? row.client! : undefined),
  } as Project;
}

export async function fetchProjects(
  locale: Locale
): Promise<{ items: Project[]; source: UseCaseSource }> {
  try {
    const { data } = await api.get<ApiProject[]>("/api/projects", {
      locale,
      pageSize: "24",
    });
    if (!Array.isArray(data) || data.length === 0) {
      return { items: PROJECTS, source: "static" };
    }

    // Union, not replacement. The CMS currently holds a subset of the
    // catalogue, so replacing outright silently dropped every project that
    // only exists in the bundled list — which emptied the production section.
    // CMS rows win on id collision; bundled-only entries are appended.
    const fromApi = data.map(toProject);
    const seen = new Set(fromApi.map((p) => p.id));
    const bundledOnly = PROJECTS.filter((p) => !seen.has(p.id));

    return { items: [...fromApi, ...bundledOnly], source: "api" };
  } catch {
    return { items: PROJECTS, source: "static" };
  }
}
