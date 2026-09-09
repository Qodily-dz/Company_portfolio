import { Router, Request, Response } from "express";
import { supabase } from "../../lib/supabase.js";
import { contactSchema } from "../../validators/schemas.js";
import { rateLimiter } from "../../middleware/rateLimit.js";
import { sendContactEmail } from "../../lib/email.js";

const router = Router();

router.post("/", rateLimiter(3, 60 * 60 * 1000), async (req: Request, res: Response) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
  }

  const data = parsed.data;

  if (data.website && data.website.length > 0) {
    return res.status(200).json({ message: "Submitted" });
  }

  const { error: dbError } = await supabase.from("contact_requests").insert({
    build: data.build,
    objective: data.objective,
    needs: data.needs,
    budget: data.budget,
    timeline: data.timeline,
    name: data.contact.name,
    company: data.contact.company || null,
    email: data.contact.email,
    phone: data.contact.phone || null,
    country: data.contact.country || null,
    message: data.contact.message || null,
  });

  if (dbError) return res.status(500).json({ error: "Failed to save request" });

  try {
    await sendContactEmail({
      name: data.contact.name,
      email: data.contact.email,
      company: data.contact.company,
      build: data.build,
      objective: data.objective,
      needs: data.needs,
      budget: data.budget,
      timeline: data.timeline,
      message: data.contact.message,
    });
  } catch {
    // Email failure doesn't block the submission
  }

  res.status(201).json({ message: "Project request submitted successfully" });
});

export default router;
