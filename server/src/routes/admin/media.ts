import { Router, Request, Response } from "express";
import { supabase } from "../../lib/supabase.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

router.post("/", async (req: Request, res: Response) => {
  const { name, type, size, url } = req.body;
  if (!name || !url) return res.status(400).json({ error: "name and url are required" });

  const { data, error } = await supabase
    .from("media")
    .insert({
      name,
      type: type || "IMAGE",
      size: size || 0,
      url,
      uploaded_by: req.user?.userId || null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ data });
});

router.get("/:id", async (req: Request, res: Response) => {
  const { data, error } = await supabase.from("media").select("*").eq("id", req.params.id).single();
  if (error || !data) return res.status(404).json({ error: "Media not found" });
  res.json({ data });
});

router.put("/:id", async (req: Request, res: Response) => {
  const { name, type, size, url } = req.body;
  if (!name && !url && type === undefined && size === undefined) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const { data, error } = await supabase
    .from("media")
    .update({
      ...(name !== undefined ? { name } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(size !== undefined ? { size } : {}),
      ...(url !== undefined ? { url } : {}),
    })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { error } = await supabase.from("media").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Media deleted" });
});

export default router;