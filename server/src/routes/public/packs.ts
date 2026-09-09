import { Router, Request, Response } from "express";
import { supabase } from "../../lib/supabase.js";
import { localeQuery } from "../../validators/schemas.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const parsed = localeQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { locale } = parsed.data;

  const { data: packs, error } = await supabase
    .from("service_packs")
    .select(`*, translations:service_pack_translations!service_pack_translations_pack_id_fkey(*)`)
    .order("order", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const shaped = (packs || []).map((p) => {
    const t = (p.translations || []).find((tr: any) => tr.locale === locale);
    return {
      id: p.id,
      name: t?.name || p.name,
      description: t?.description || "",
      deliverables: t?.deliverables || [],
      price: p.price,
      priceLabel: p.price_label,
      currency: p.currency,
      period: p.period,
      featured: p.featured,
      order: p.order,
    };
  });

  res.json({ data: shaped });
});

export default router;