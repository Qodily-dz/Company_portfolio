import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { authMiddleware, adminOnly } from "./middleware/auth.js";

import publicProjects from "./routes/public/projects.js";
import publicArticles from "./routes/public/articles.js";
import publicServices from "./routes/public/services.js";
import publicPacks from "./routes/public/packs.js";
import publicProcess from "./routes/public/process.js";
import publicEngineering from "./routes/public/engineering.js";
import publicGrowth from "./routes/public/growth.js";
import publicLab from "./routes/public/lab.js";
import publicContact from "./routes/public/contact.js";
import publicSite from "./routes/public/site.js";

import adminAuth from "./routes/admin/auth.js";
import adminDashboard from "./routes/admin/dashboard.js";
import adminProjects from "./routes/admin/projects.js";
import adminArticles from "./routes/admin/articles.js";
import adminContacts from "./routes/admin/contacts.js";
import adminWebsite from "./routes/admin/website.js";
import adminPacks from "./routes/admin/packs.js";
import adminMedia from "./routes/admin/media.js";
import adminUsers from "./routes/admin/users.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".up.railway.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// ── Root & Health ───────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    name: "Qodily API",
    status: "online",
    health: "/api/health",
    frontend: process.env.CORS_ORIGIN || "http://localhost:3000",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Public API ──────────────────────────────────────
app.use("/api/projects", publicProjects);
app.use("/api/articles", publicArticles);
app.use("/api/services", publicServices);
app.use("/api/packs", publicPacks);
app.use("/api/process", publicProcess);
app.use("/api/engineering", publicEngineering);
app.use("/api/growth", publicGrowth);
app.use("/api/lab", publicLab);
app.use("/api/contact", publicContact);
app.use("/api", publicSite);

// ── Auth (no middleware) ────────────────────────────
app.use("/api/auth", adminAuth);

// ── Admin API (auth required) ───────────────────────
app.use("/api/admin/dashboard", authMiddleware, adminDashboard);
app.use("/api/admin/projects", authMiddleware, adminProjects);
app.use("/api/admin/articles", authMiddleware, adminArticles);
app.use("/api/admin/contacts", authMiddleware, adminContacts);
app.use("/api/admin/packs", authMiddleware, adminPacks);
app.use("/api/admin/media", authMiddleware, adminMedia);
app.use("/api/admin/users", authMiddleware, adminOnly, adminUsers);
app.use("/api/admin", authMiddleware, adminWebsite);

app.listen(PORT, () => {
  console.log(`[qodily-api] Running on http://localhost:${PORT}`);
});

export default app;
