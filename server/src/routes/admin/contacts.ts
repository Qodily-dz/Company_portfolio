import { Router, Request, Response } from "express";
import { supabase } from "../../lib/supabase.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("contact_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

router.get("/:id", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("contact_requests")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ error: "Request not found" });
  res.json({ data });
});

router.patch("/:id/status", async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!["NEW", "CONTACTED", "IN_DISCUSSION", "CLOSED"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const { error } = await supabase
    .from("contact_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Status updated" });
});

router.patch("/:id/notes", async (req: Request, res: Response) => {
  const { notes } = req.body;
  const { error } = await supabase
    .from("contact_requests")
    .update({ notes, updated_at: new Date().toISOString() })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Notes updated" });
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { error } = await supabase.from("contact_requests").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Contact request deleted" });
});

export default router;
