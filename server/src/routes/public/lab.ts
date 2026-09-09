import { Router, Request, Response } from "express";
import { supabase } from "../../lib/supabase.js";
import { localeQuery } from "../../validators/schemas.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const parsed = localeQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { locale } = parsed.data;

  const { data: experiments, error } = await supabase
    .from("lab_experiments")
    .select(`*, translations:lab_experiment_translations!lab_experiment_translations_experiment_id_fkey(*)`)
    .order("order", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const shaped = (experiments || []).map((e) => {
    const t = (e.translations || []).find((tr: any) => tr.locale === locale);
    return {
      id: e.id,
      label: e.label,
      status: e.status,
      title: t?.title || "",
      purpose: t?.purpose || "",
      note: t?.note || "",
    };
  });

  res.json({ data: shaped });
});

export default router;
