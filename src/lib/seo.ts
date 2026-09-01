import { siteConfig } from "@/config/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";
import type { Article } from "@/lib/insights";

/* ---------------------------------------------------------------------------
 * JSON-LD structured data builders.
 *
 * Each function returns a plain object that is serialised into a <script
 * type="application/ld+json"> tag. No fabricated claims — the schema
 * describes the site as it actually is.
 * ------------------------------------------------------------------------- */

export type JsonLdItem = Record<string, unknown> | Record<string, unknown>[];

export function organizationSchema(dict: Dictionary): JsonLdItem {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.legalName,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    description: dict.structuredData.organizationDescription,
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.address.city,
      addressCountry: "DZ",
    },
    sameAs: [
      siteConfig.social.github,
      siteConfig.social.linkedin,
      siteConfig.social.twitter,
      siteConfig.social.instagram,
      siteConfig.social.dribbble,
      siteConfig.social.behance,
    ],
  };
}

export function websiteSchema(dict: Dictionary, locale: Locale, url: string): JsonLdItem {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    url,
    name: siteConfig.legalName,
    description: dict.meta.description,
    inLanguage: locale,
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function servicesSchema(dict: Dictionary, url: string): JsonLdItem[] {
  const services = dict.structuredData.serviceDescriptions;
  const ids = ["build", "design", "grow", "grow-strategy"];
  return services.map((name, i) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}/#service-${ids[i] ?? i}`,
    name,
    description: name,
    provider: { "@id": `${siteConfig.url}/#organization` },
    serviceType: name,
    areaServed: { "@type": "Country", name: "DZ" },
    priceRange: "$$",
  }));
}

export function breadcrumbSchema(
  url: string,
  items: { name: string; path: string }[],
): JsonLdItem {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}

export function articleSchema(
  locale: Locale,
  dict: Dictionary,
  article: Article,
  url: string,
): JsonLdItem {
  const translated = dict.articles[article.slug];
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}/#article`,
    headline: translated?.title ?? article.title,
    description: translated?.summary ?? article.summary,
    inLanguage: locale,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      "@type": "Organization",
      name: siteConfig.legalName,
      url: siteConfig.url,
    },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    mainEntityOfPage: { "@id": url },
  };
}