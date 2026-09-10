import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { supabase } from "../../lib/supabase.js";
import { signToken } from "../../lib/jwt.js";
import { loginSchema } from "../../validators/schemas.js";
import { authMiddleware } from "../../middleware/auth.js";
import { rateLimiter } from "../../middleware/rateLimit.js";

const router = Router();

// Throttled: this router is mounted without authMiddleware, so /login is
// reachable by anyone and was previously unlimited against bcrypt.
router.post("/login", rateLimiter(10, 15 * 60 * 1000), async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid credentials" });

  const { email, password } = parsed.data;

  const { data: user, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) return res.status(401).json({ error: "Invalid email or password" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid email or password" });

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// authMiddleware is what populates req.user. Without it this route read an
// always-undefined value and answered 401 to every caller, valid or not.
router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });

  const { data: user, error } = await supabase
    .from("admin_users")
    .select("id, name, email, role, created_at")
    .eq("id", req.user.userId)
    .single();

  if (error || !user) return res.status(404).json({ error: "User not found" });
  res.json({ data: user });
});

export default router;
