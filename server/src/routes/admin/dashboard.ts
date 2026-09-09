import { Router, Request, Response } from "express";
import { supabase } from "../../lib/supabase.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const [projects, articles, contacts, recentContacts, recentProjects] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("articles").select("id", { count: "exact", head: true }),
    supabase.from("contact_requests").select("id", { count: "exact", head: true }),
    supabase.from("contact_requests").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("projects").select("*, translations:project_translations!project_translations_project_id_fkey(title, locale)").order("updated_at", { ascending: false }).limit(5),
  ]);

  const newContacts = await supabase
    .from("contact_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "NEW");

  res.json({
    data: {
      stats: {
        totalProjects: projects.count || 0,
        totalArticles: articles.count || 0,
        totalContacts: contacts.count || 0,
        newContacts: newContacts.count || 0,
      },
      recentContacts: recentContacts.data || [],
      recentProjects: (recentProjects.data || []).map((p) => ({
        id: p.id,
        name: (p.translations || []).find((t: any) => t.locale === "en")?.title || p.slug,
        status: p.status,
        featured: p.featured,
        updated: p.updated_at,
      })),
    },
  });
});

export default router;
