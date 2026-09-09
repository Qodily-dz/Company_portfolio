import { Router, Request, Response } from "express";
import { supabase } from "../../lib/supabase.js";
import { servicePackSchema } from "../../validators/schemas.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("service_packs")
    .select(`*, translations:service_pack_translations!service_pack_translations_pack_id_fkey(*)`)
    .order("order", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const shaped = (data || []).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    priceLabel: p.price_label,
    currency: p.currency,
    period: p.period,
    featured: p.featured,
    order: p.order,
    translations: (p.translations || []).reduce((acc: any, t: any) => {
      acc[t.locale] = { name: t.name, description: t.description, deliverables: t.deliverables };
      return acc;
    }, {}),
  }));

  res.json({ data: shaped });
});

router.post("/", async (req: Request, res: Response) => {
  const parsed = servicePackSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { translations, ...packData } = parsed.data;

  const { data: pack, error } = await supabase
    .from("service_packs")
    .insert({
      name: packData.name,
      price: packData.price ?? null,
      price_label: packData.priceLabel,
      currency: packData.currency,
      period: packData.period,
      featured: packData.featured,
      order: packData.order,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const inserts = Object.entries(translations).map(([locale, t]) => ({
    pack_id: pack.id,
    locale,
    name: t.name,
    description: t.description,
    deliverables: t.deliverables,
  }));

  await supabase.from("service_pack_translations").insert(inserts);
  res.status(201).json({ data: pack });
});

router.put("/:id", async (req: Request, res: Response) => {
  const parsed = servicePackSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { translations, ...packData } = parsed.data;

  const { error } = await supabase
    .from("service_packs")
    .update({
      name: packData.name,
      price: packData.price ?? null,
      price_label: packData.priceLabel,
      currency: packData.currency,
      period: packData.period,
      featured: packData.featured,
      order: packData.order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });

  await supabase.from("service_pack_translations").delete().eq("pack_id", req.params.id);

  const inserts = Object.entries(translations).map(([locale, t]) => ({
    pack_id: req.params.id,
    locale,
    name: t.name,
    description: t.description,
    deliverables: t.deliverables,
  }));

  await supabase.from("service_pack_translations").insert(inserts);
  res.json({ message: "Service pack updated" });
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { error } = await supabase.from("service_packs").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Service pack deleted" });
});

export default router;