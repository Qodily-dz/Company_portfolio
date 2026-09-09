import { Router, Request, Response } from "express";
import { supabase } from "../../lib/supabase.js";
import { localeQuery } from "../../validators/schemas.js";

const router = Router();

router.get("/config", async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from("site_config").select("*").eq("id", 1).single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

router.get("/navigation", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("navigation_items")
    .select("*")
    .eq("visible", true)
    .order("order", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

router.get("/seo/:path", async (req: Request, res: Response) => {
  const parsed = localeQuery.safeParse(req.query);
  const locale = parsed.success ? parsed.data.locale : "en";
  const pagePath = `/${req.params.path}`;

  const { data, error } = await supabase
    .from("seo_settings")
    .select("*")
    .eq("page_path", pagePath)
    .eq("locale", locale)
    .single();

  if (error || !data) return res.status(404).json({ error: "SEO settings not found" });
  res.json({ data });
});

export default router;
