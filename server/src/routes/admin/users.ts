import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { supabase } from "../../lib/supabase.js";
import { adminUserCreateSchema, adminUserUpdateSchema } from "../../validators/schemas.js";

const router = Router();

function shape(u: any) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    created_at: u.created_at,
    updated_at: u.updated_at,
  };
}

async function adminCount(): Promise<number | null> {
  const { count, error } = await supabase
    .from("admin_users")
    .select("id", { count: "exact", head: true })
    .eq("role", "ADMIN");
  return error ? null : (count ?? 0);
}

router.get("/", async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, name, email, role, created_at, updated_at")
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ data: (data || []).map(shape) });
});

router.post("/", async (req: Request, res: Response) => {
  const parsed = adminUserCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { name, email, password, role } = parsed.data;

  const { data: existing } = await supabase
    .from("admin_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) return res.status(409).json({ error: "A user with this email already exists" });

  const password_hash = await bcrypt.hash(password, 12);
  const { data, error } = await supabase
    .from("admin_users")
    .insert({ name, email, password_hash, role })
    .select("id, name, email, role, created_at, updated_at")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ data: shape(data) });
});

router.put("/:id", async (req: Request, res: Response) => {
  const parsed = adminUserUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { name, email, role, password } = parsed.data;
  const { id } = req.params;

  const { data: current, error: fetchErr } = await supabase
    .from("admin_users")
    .select("id, email, role")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr || !current) return res.status(404).json({ error: "User not found" });

  if (role && role !== current.role && current.role === "ADMIN") {
    const admins = await adminCount();
    if (admins !== null && admins <= 1) {
      return res.status(409).json({ error: "Cannot change the role of the last admin" });
    }
  }

  if (email && email !== current.email) {
    const { data: clash } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email)
      .neq("id", id)
      .maybeSingle();
    if (clash) return res.status(409).json({ error: "A user with this email already exists" });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name) patch.name = name;
  if (email) patch.email = email;
  if (role) patch.role = role;
  if (password) patch.password_hash = await bcrypt.hash(password, 12);

  const { error } = await supabase.from("admin_users").update(patch).eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "User updated" });
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (req.user?.userId === id) {
    return res.status(409).json({ error: "You cannot delete your own account" });
  }

  const { data: target, error: fetchErr } = await supabase
    .from("admin_users")
    .select("id, role")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr || !target) return res.status(404).json({ error: "User not found" });

  if (target.role === "ADMIN") {
    const admins = await adminCount();
    if (admins !== null && admins <= 1) {
      return res.status(409).json({ error: "Cannot delete the last admin" });
    }
  }

  const { error } = await supabase.from("admin_users").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "User deleted" });
});

export default router;