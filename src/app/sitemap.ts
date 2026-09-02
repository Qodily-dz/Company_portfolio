import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { locales } from "@/lib/i18n/config";
import { ARTICLES } from "@/lib/insights";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;

  const languageAlternates = () =>
    Object.fromEntries(locales.map((l) => [l, `${base}/${l}`]));

  const entries: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];

  // Homepage per locale
  for (const locale of locales) {
    entries.push({
      url: `${base}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: languageAlternates(),
      },
    });
  }

  // Top-level pages per locale
  const topLevel = ["work", "services", "process", "about", "contact"];
  for (const locale of locales) {
    for (const seg of topLevel) {
      entries.push({
        url: `${base}/${locale}/${seg}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${base}/${l}/${seg}`]),
          ),
        },
      });
    }
  }

  // Insights listing per locale
  for (const locale of locales) {
    entries.push({
      url: `${base}/${locale}/insights`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${base}/${l}/insights`]),
        ),
      },
    });
  }

  // Articles per locale
  for (const locale of locales) {
    for (const article of ARTICLES) {
      entries.push({
        url: `${base}/${locale}/insights/${article.slug}`,
        lastModified: new Date(article.date),
        changeFrequency: "yearly",
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${base}/${l}/insights/${article.slug}`]),
          ),
        },
      });
    }
  }

  return entries;
}