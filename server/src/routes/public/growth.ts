import { Router, Request, Response } from "express";
import { supabase } from "../../lib/supabase.js";
import { localeQuery } from "../../validators/schemas.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const parsed = localeQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { locale } = parsed.data;

  const [stagesResult, servicesResult] = await Promise.all([
    supabase
      .from("growth_stages")
      .select(`*, translations:growth_stage_translations!growth_stage_translations_stage_id_fkey(*)`)
      .order("order", { ascending: true }),
    supabase
      .from("growth_services")
      .select(`*, stages:growth_service_stages!growth_service_stages_service_id_fkey(stage_id)`),
  ]);

  if (stagesResult.error) return res.status(500).json({ error: stagesResult.error.message });
  if (servicesResult.error) return res.status(500).json({ error: servicesResult.error.message });

  const stages = (stagesResult.data || []).map((s) => {
    const t = (s.translations || []).find((tr: any) => tr.locale === locale);
    return { id: s.id, label: t?.label || "", order: s.order };
  });

  const services = (servicesResult.data || []).map((s) => ({
    id: s.id,
    name: s.name,
    note: s.note,
    stages: (s.stages || []).map((st: any) => st.stage_id),
  }));

  res.json({ data: { stages, services } });
});

export default router;
