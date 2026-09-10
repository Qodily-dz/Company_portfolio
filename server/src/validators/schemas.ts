import { z } from "zod";

const locales = ["en", "fr", "ar"] as const;

export const localeQuery = z.object({
  locale: z.enum(locales).default("en"),
});

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const contactSchema = z.object({
  build: z.enum(["Website", "Web App", "Mobile App", "Desktop App", "Custom Software", "Marketing", "Branding", "Other"]),
  objective: z.string().min(10).max(600),
  needs: z.array(z.enum(["Discovery & planning", "UI / UX design", "Development", "Product strategy", "Digital marketing", "Brand & identity", "Automation", "Ongoing support"])).min(1),
  budget: z.enum(["Under 1k", "1k – 5k", "5k – 15k", "15k – 50k", "50k+", "Not sure"]),
  timeline: z.enum(["ASAP", "1–3 months", "3–6 months", "6+ months", "Not sure"]),
  contact: z.object({
    name: z.string().min(1).max(120),
    company: z.string().max(120).optional().default(""),
    email: z.string().email().max(254),
    phone: z.string().max(40).optional().default(""),
    country: z.string().max(80).optional().default(""),
    message: z.string().max(2000).optional().default(""),
  }),
  website: z.string().max(0).optional().default(""),
});

export const galleryImageSchema = z.object({
  url: z.string().url().or(z.literal("")),
  alt: z.string().optional().default(""),
  caption: z.string().optional().default(""),
});

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category: z.string(),
  short: z.string().max(300),
  summary: z.string(),
  problem: z.string(),
  solution: z.string(),
  approach: z.string(),
  architecture: z.string().optional().default(""),
  design: z.string(),
  product: z.string(),
  outcome: z.string(),
  gallery: z.array(galleryImageSchema).optional().default([]),
  accentA: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentB: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  span: z.string(),
  client: z.string().optional(),
  status: z.enum(["DRAFT", "IN_PROGRESS", "PUBLISHED"]),
  featured: z.boolean(),
  order: z.number().int(),
  translations: z.record(z.object({
    title: z.string(),
    category: z.string(),
    short: z.string(),
    summary: z.string(),
    problem: z.string(),
    solution: z.string(),
    approach: z.string(),
    architecture: z.string().optional().default(""),
    design: z.string(),
    product: z.string(),
    outcome: z.string(),
  })),
  technologies: z.array(z.string()),
});

export const servicePackSchema = z.object({
  name: z.string().min(1).max(120),
  price: z.number().min(0).nullable().optional(),
  priceLabel: z.string().max(80).optional().default(""),
  currency: z.string().max(8).optional().default("$"),
  period: z.string().max(40).optional().default("one-off"),
  featured: z.boolean(),
  order: z.number().int(),
  translations: z.record(z.object({
    name: z.string(),
    description: z.string(),
    deliverables: z.array(z.string()),
  })),
});

export const articleSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category: z.enum(["TECHNOLOGY", "SOFTWARE", "BUSINESS", "DESIGN", "MARKETING", "DIGITAL_TRANSFORMATION"]),
  readTime: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  translations: z.record(z.object({
    title: z.string(),
    summary: z.string().max(500),
    body: z.array(z.string()),
    keywords: z.array(z.string()),
  })),
});

export const contactStatusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "IN_DISCUSSION", "CLOSED"]),
});

export const contactNotesSchema = z.object({
  notes: z.string(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const adminUserCreateSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  password: z.string().min(8).max(200),
  role: z.enum(["ADMIN", "EDITOR"]).default("EDITOR"),
});

export const adminUserUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().max(254).optional(),
  role: z.enum(["ADMIN", "EDITOR"]).optional(),
  password: z.string().min(8).max(200).optional(),
});
