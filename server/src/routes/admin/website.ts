import { Router, Request, Response } from "express";
import { supabase } from "../../lib/supabase.js";

const router = Router();

router.get("/config", async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from("site_config").select("*").eq("id", 1).single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

router.put("/config", async (req: Request, res: Response) => {
  const { name, legalName, tagline, positioning, description, url, email, phone, whatsapp, addressCity, addressCountry, defaultLanguage, social, seoKeywords } = req.body;

  const { error } = await supabase
    .from("site_config")
    .update({
      name, legal_name: legalName, tagline, positioning, description, url, email, phone, whatsapp,
      address_city: addressCity, address_country: addressCountry,
      default_language: defaultLanguage, social, seo_keywords: seoKeywords,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Config updated" });
});

router.get("/navigation", async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from("navigation_items").select("*").order("order", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

router.post("/navigation", async (req: Request, res: Response) => {
  const { label, href, location, visible, order } = req.body;
  const { data, error } = await supabase
    .from("navigation_items")
    .insert({ label, href, location: location || "header", visible: visible !== false, order: order || 0 })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ data });
});

router.put("/navigation/:id", async (req: Request, res: Response) => {
  const { label, href, location, visible, order } = req.body;
  const { error } = await supabase
    .from("navigation_items")
    .update({ label, href, location, visible, order })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Navigation updated" });
});

router.delete("/navigation/:id", async (req: Request, res: Response) => {
  const { error } = await supabase.from("navigation_items").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Navigation deleted" });
});

router.get("/seo", async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from("seo_settings").select("*").order("page_path");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

router.put("/seo", async (req: Request, res: Response) => {
  const { settings } = req.body;
  if (!Array.isArray(settings)) return res.status(400).json({ error: "Settings must be an array" });

  for (const s of settings) {
    await supabase
      .from("seo_settings")
      .upsert({
        page_path: s.pagePath,
        locale: s.locale,
        meta_title: s.metaTitle,
        meta_description: s.metaDescription,
        og_image: s.ogImage || null,
      }, { onConflict: "page_path,locale" });
  }

  res.json({ message: "SEO settings updated" });
});

router.get("/services", async (_req: Request, res: Response) => {
  const { data, error } = await supabase
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
  res.json({ data });
});

router.put("/pillars/:id", async (req: Request, res: Response) => {
  const { translations } = req.body;
  if (!translations) return res.status(400).json({ error: "Translations required" });

  await supabase.from("pillar_translations").delete().eq("pillar_id", req.params.id);

  const inserts = Object.entries(translations).map(([locale, t]: [string, any]) => ({
    pillar_id: req.params.id,
    locale,
    label: t.label,
    tagline: t.tagline,
    lede: t.lede,
  }));

  const { error } = await supabase.from("pillar_translations").insert(inserts);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Pillar updated" });
});

router.post("/services", async (req: Request, res: Response) => {
  const { pillarId, name, order, translations } = req.body;

  const { data: service, error } = await supabase
    .from("services")
    .insert({ pillar_id: pillarId, name, order: order || 0 })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  if (translations) {
    const inserts = Object.entries(translations).map(([locale, t]: [string, any]) => ({
      service_id: service.id,
      locale,
      name: t.name,
    }));
    await supabase.from("service_translations").insert(inserts);
  }

  res.status(201).json({ data: service });
});

router.delete("/services/:id", async (req: Request, res: Response) => {
  const { error } = await supabase.from("services").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Service deleted" });
});

export default router;
