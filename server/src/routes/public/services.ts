import { Router, Request, Response } from "express";
import { supabase } from "../../lib/supabase.js";
import { localeQuery } from "../../validators/schemas.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const parsed = localeQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { locale } = parsed.data;

  const { data: pillars, error } = await supabase
    .from("pillars")
    .select(`
      *,
      translations:pillar_translations!pillar_translations_pillar_id_fkey(*),
      services:services!services_pillar_id_fkey(
        *,
        translations:service_translations!service_translations_service_id_fkey(*)
      )
    `)
    .order("order", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const shaped = (pillars || []).map((p) => {
    const t = (p.translations || []).find((tr: any) => tr.locale === locale);
    return {
      id: p.id,
      index: p.index,
      label: t?.label || p.id,
      tagline: t?.tagline || "",
      lede: t?.lede || "",
      services: (p.services || [])
        .sort((a: any, b: any) => a.order - b.order)
        .map((s: any) => {
          const st = (s.translations || []).find((tr: any) => tr.locale === locale);
          return st?.name || s.name;
        }),
    };
  });

  res.json({ data: shaped });
});

export default router;
