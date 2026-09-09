import { Router, Request, Response } from "express";
import { supabase } from "../../lib/supabase.js";
import { localeQuery, paginationQuery } from "../../validators/schemas.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const parsed = localeQuery.merge(paginationQuery).safeParse({ ...req.query, category: req.query.category });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { locale, page, pageSize } = parsed.data;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("articles")
    .select(`*, translations:article_translations!article_translations_article_id_fkey(*)`, { count: "exact" })
    .eq("status", "PUBLISHED")
    .order("date", { ascending: false });

  if (req.query.category) {
    query = query.eq("category", req.query.category);
  }

  const { data: articles, count, error } = await query.range(from, to);

  if (error) return res.status(500).json({ error: error.message });

  const shaped = (articles || []).map((a) => ({
    slug: a.slug,
    category: a.category,
    date: a.date,
    readTime: a.read_time,
    ...(a.translations || []).find((t: any) => t.locale === locale) || {},
  }));

  res.json({ data: shaped, meta: { total: count || 0, page, pageSize } });
});

router.get("/:slug", async (req: Request, res: Response) => {
  const localeParsed = localeQuery.safeParse(req.query);
  const locale = localeParsed.success ? localeParsed.data.locale : "en";

  const { data: article, error } = await supabase
    .from("articles")
    .select(`*, translations:article_translations!article_translations_article_id_fkey(*)`)
    .eq("slug", req.params.slug)
    .single();

  if (error || !article) return res.status(404).json({ error: "Article not found" });

  const translation = (article.translations || []).find((t: any) => t.locale === locale);

  res.json({
    data: {
      slug: article.slug,
      category: article.category,
      date: article.date,
      readTime: article.read_time,
      ...translation,
    },
  });
});

export default router;
