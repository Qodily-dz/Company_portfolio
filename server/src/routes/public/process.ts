import { Router, Request, Response } from "express";
import { supabase } from "../../lib/supabase.js";
import { localeQuery } from "../../validators/schemas.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const parsed = localeQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { locale } = parsed.data;

  const { data: stages, error } = await supabase
    .from("process_stages")
    .select(`*, translations:process_stage_translations!process_stage_translations_stage_id_fkey(*)`)
    .order("order", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const shaped = (stages || []).map((s) => {
    const t = (s.translations || []).find((tr: any) => tr.locale === locale);
    return {
      id: s.id,
      num: s.num,
      title: t?.title || "",
      desc: t?.description || "",
      whatWeDo: t?.what_we_do || [],
      deliverables: t?.deliverables || [],
      technologies: t?.technologies || [],
    };
  });

  res.json({ data: shaped });
});

export default router;
