import { Router, Request, Response } from "express";
import { supabase } from "../../lib/supabase.js";
import { localeQuery, paginationQuery } from "../../validators/schemas.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const parsed = localeQuery.merge(paginationQuery).safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { locale, page, pageSize } = parsed.data;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { count } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("status", "PUBLISHED");

  const { data: projects, error } = await supabase
    .from("projects")
    .select(`
      *,
      translations:project_translations!project_translations_project_id_fkey(*),
      technologies:project_technologies!project_technologies_project_id_fkey(technology)
    `)
    .eq("status", "PUBLISHED")
    .order("order", { ascending: true })
    .range(from, to);

  if (error) return res.status(500).json({ error: error.message });

  const shaped = (projects || []).map((p) => ({
    id: p.id,
    slug: p.slug,
    short: p.short,
    summary: p.summary,
    architecture: p.architecture || p.approach,
    accent: { a: p.accent_a, b: p.accent_b },
    span: p.span,
    client: p.client,
    featured: p.featured,
    technology: (p.technologies || []).map((t: any) => t.technology),
    ...(p.translations || []).find((t: any) => t.locale === locale) || {},
  }));

  res.json({ data: shaped, meta: { total: count || 0, page, pageSize } });
});

router.get("/:slug", async (req: Request, res: Response) => {
  const localeParsed = localeQuery.safeParse(req.query);
  const locale = localeParsed.success ? localeParsed.data.locale : "en";

  const { data: project, error } = await supabase
    .from("projects")
    .select(`
      *,
      translations:project_translations!project_translations_project_id_fkey(*),
      technologies:project_technologies!project_technologies_project_id_fkey(technology)
    `)
    .eq("slug", req.params.slug)
    .single();

  if (error || !project) return res.status(404).json({ error: "Project not found" });

  const translation = (project.translations || []).find((t: any) => t.locale === locale);
  const tr: any = {
    title: translation?.title,
    category: translation?.category,
    short: translation?.short,
    summary: translation?.summary,
    problem: translation?.problem,
    solution: translation?.solution,
    approach: translation?.approach,
    architecture: translation?.architecture || translation?.approach,
    design: translation?.design,
    product: translation?.product,
    outcome: translation?.outcome,
  };

  res.json({
    data: {
      id: project.id,
      slug: project.slug,
      short: project.short,
      summary: project.summary,
      problem: project.problem,
      solution: project.solution,
      approach: project.approach,
      architecture: project.architecture || project.approach,
      design: project.design,
      product: project.product,
      outcome: project.outcome,
      gallery: Array.isArray(project.gallery) ? project.gallery : [],
      accent: { a: project.accent_a, b: project.accent_b },
      span: project.span,
      client: project.client,
      technology: (project.technologies || []).map((t: any) => t.technology),
      ...tr,
    },
  });
});

export default router;
