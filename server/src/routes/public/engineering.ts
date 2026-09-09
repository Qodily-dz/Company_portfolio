import { Router, Request, Response } from "express";
import { supabase } from "../../lib/supabase.js";
import { localeQuery } from "../../validators/schemas.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const parsed = localeQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { locale } = parsed.data;

  const { data: nodes, error } = await supabase
    .from("engineering_nodes")
    .select(`*, translations:engineering_node_translations!engineering_node_translations_node_id_fkey(*)`)
    .order("order", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const shaped = (nodes || []).map((n) => {
    const t = (n.translations || []).find((tr: any) => tr.locale === locale);
    return {
      id: n.id,
      glyph: n.glyph,
      pos: [n.pos_x, n.pos_y, n.pos_z],
      label: t?.label || "",
      desc: t?.description || "",
      details: t?.details || [],
    };
  });

  res.json({ data: shaped });
});

export default router;
