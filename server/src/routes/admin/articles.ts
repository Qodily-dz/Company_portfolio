import { Router, Request, Response } from "express";
import { supabase } from "../../lib/supabase.js";
import { articleSchema } from "../../validators/schemas.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("articles")
    .select(`*, translations:article_translations!article_translations_article_id_fkey(*)`)
    .order("date", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const shaped = (data || []).map((a) => ({
    id: a.id,
    slug: a.slug,
    category: a.category,
    date: a.date,
    readTime: a.read_time,
    status: a.status,
    translations: (a.translations || []).reduce((acc: any, t: any) => {
      acc[t.locale] = { title: t.title, summary: t.summary, body: t.body, keywords: t.keywords };
      return acc;
    }, {}),
  }));

  res.json({ data: shaped });
});

router.post("/", async (req: Request, res: Response) => {
  const parsed = articleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { translations, ...articleData } = parsed.data;

  const { data: article, error } = await supabase
    .from("articles")
    .insert({
      slug: articleData.slug,
      category: articleData.category,
      read_time: articleData.readTime,
      status: articleData.status,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const inserts = Object.entries(translations).map(([locale, t]) => ({
    article_id: article.id,
    locale,
    title: t.title,
    summary: t.summary,
    body: t.body,
    keywords: t.keywords,
  }));

  await supabase.from("article_translations").insert(inserts);
  res.status(201).json({ data: article });
});

router.put("/:id", async (req: Request, res: Response) => {
  const parsed = articleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { translations, ...articleData } = parsed.data;

  const { error } = await supabase
    .from("articles")
    .update({
      slug: articleData.slug,
      category: articleData.category,
      read_time: articleData.readTime,
      status: articleData.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });

  await supabase.from("article_translations").delete().eq("article_id", req.params.id);

  const inserts = Object.entries(translations).map(([locale, t]) => ({
    article_id: req.params.id,
    locale,
    title: t.title,
    summary: t.summary,
    body: t.body,
    keywords: t.keywords,
  }));

  await supabase.from("article_translations").insert(inserts);
  res.json({ message: "Article updated" });
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { error } = await supabase.from("articles").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Article deleted" });
});

export default router;
