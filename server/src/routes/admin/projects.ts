import { Router, Request, Response } from "express";
import { supabase } from "../../lib/supabase.js";
import { projectSchema } from "../../validators/schemas.js";

const router = Router();

function shapeProject(p: any) {
  return {
    id: p.id,
    slug: p.slug,
    status: p.status,
    featured: p.featured,
    order: p.order,
    client: p.client,
    accentA: p.accent_a,
    accentB: p.accent_b,
    span: p.span,
    category: p.category,
    short: p.short,
    summary: p.summary,
    problem: p.problem,
    solution: p.solution,
    approach: p.approach,
    architecture: p.architecture || p.approach,
    design: p.design,
    product: p.product,
    outcome: p.outcome,
    gallery: Array.isArray(p.gallery) ? p.gallery : [],
    technologies: (p.technologies || []).map((t: any) => t.technology),
    translations: (p.translations || []).reduce((acc: any, t: any) => {
      acc[t.locale] = { title: t.title, category: t.category, short: t.short, summary: t.summary, problem: t.problem, solution: t.solution, approach: t.approach, architecture: t.architecture || t.approach, design: t.design, product: t.product, outcome: t.outcome };
      return acc;
    }, {}),
  };
}

async function fetchProjectById(id: string) {
  return supabase
    .from("projects")
    .select(`
      *,
      translations:project_translations!project_translations_project_id_fkey(*),
      technologies:project_technologies!project_technologies_project_id_fkey(technology)
    `)
    .eq("id", id)
    .single();
}

router.get("/", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      translations:project_translations!project_translations_project_id_fkey(*),
      technologies:project_technologies!project_technologies_project_id_fkey(technology)
    `)
    .order("order", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data: (data || []).map(shapeProject) });
});

router.get("/:id", async (req: Request, res: Response) => {
  const { data, error } = await fetchProjectById(String(req.params.id));
  if (error || !data) return res.status(404).json({ error: "Project not found" });
  res.json({ data: shapeProject(data) });
});

router.post("/", async (req: Request, res: Response) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { translations, technologies, ...projectData } = parsed.data;

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      slug: projectData.slug,
      category: projectData.category,
      short: projectData.short,
      summary: projectData.summary,
      problem: projectData.problem,
      solution: projectData.solution,
      approach: projectData.approach,
      architecture: projectData.architecture || projectData.approach,
      design: projectData.design,
      product: projectData.product,
      outcome: projectData.outcome,
      gallery: Array.isArray(projectData.gallery) ? projectData.gallery : [],
      accent_a: projectData.accentA,
      accent_b: projectData.accentB,
      span: projectData.span,
      client: projectData.client,
      status: projectData.status,
      featured: projectData.featured,
      order: projectData.order,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const translationsInserts = Object.entries(translations).map(([locale, t]) => ({
    project_id: project.id,
    locale,
    title: t.title,
    category: t.category,
    short: t.short,
    summary: t.summary,
    problem: t.problem,
    solution: t.solution,
    approach: t.approach,
    architecture: t.architecture || t.approach,
    design: t.design,
    product: t.product,
    outcome: t.outcome,
  }));

  const techInserts = technologies.map((technology) => ({
    project_id: project.id,
    technology,
  }));

  await supabase.from("project_translations").insert(translationsInserts);
  await supabase.from("project_technologies").insert(techInserts);

  res.status(201).json({ data: project });
});

router.put("/:id", async (req: Request, res: Response) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { translations, technologies, ...projectData } = parsed.data;

  const { error } = await supabase
    .from("projects")
    .update({
      slug: projectData.slug,
      category: projectData.category,
      short: projectData.short,
      summary: projectData.summary,
      problem: projectData.problem,
      solution: projectData.solution,
      approach: projectData.approach,
      architecture: projectData.architecture || projectData.approach,
      design: projectData.design,
      product: projectData.product,
      outcome: projectData.outcome,
      gallery: Array.isArray(projectData.gallery) ? projectData.gallery : [],
      accent_a: projectData.accentA,
      accent_b: projectData.accentB,
      span: projectData.span,
      client: projectData.client,
      status: projectData.status,
      featured: projectData.featured,
      order: projectData.order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });

  await supabase.from("project_translations").delete().eq("project_id", req.params.id);
  await supabase.from("project_technologies").delete().eq("project_id", req.params.id);

  const translationsInserts = Object.entries(translations).map(([locale, t]) => ({
    project_id: req.params.id,
    locale,
    title: t.title,
    category: t.category,
    short: t.short,
    summary: t.summary,
    problem: t.problem,
    solution: t.solution,
    approach: t.approach,
    architecture: t.architecture || t.approach,
    design: t.design,
    product: t.product,
    outcome: t.outcome,
  }));

  const techInserts = technologies.map((technology) => ({
    project_id: req.params.id,
    technology,
  }));

  await supabase.from("project_translations").insert(translationsInserts);
  await supabase.from("project_technologies").insert(techInserts);

  res.json({ message: "Project updated" });
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { error } = await supabase.from("projects").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Project deleted" });
});

router.patch("/:id/featured", async (req: Request, res: Response) => {
  const { featured } = req.body;
  const { error } = await supabase
    .from("projects")
    .update({ featured, updated_at: new Date().toISOString() })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Featured updated" });
});

router.patch("/:id/order", async (req: Request, res: Response) => {
  const { order } = req.body;
  const { error } = await supabase
    .from("projects")
    .update({ order, updated_at: new Date().toISOString() })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Order updated" });
});

export default router;
