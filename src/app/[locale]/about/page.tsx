import type { Metadata } from "next";
import { SiteShell } from "@/components/shell/SiteShell";
import { AboutPage } from "@/components/about-page/AboutPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { locales, toLocale } from "@/lib/i18n/config";
import { breadcrumbSchema, organizationSchema, websiteSchema } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeValue } = await params;
  const locale = toLocale(localeValue);
  const dict = getDictionary(locale);

  return {
    title: dict.pages.about.title,
    description: dict.pages.about.description,
    keywords: [...dict.seo.keywords, "about", "vision", "mission", "values"],
    openGraph: {
      title: `${dict.pages.about.title} — ${siteConfig.name}`,
      description: dict.pages.about.description,
      url: `${siteConfig.url}/${locale}/about`,
      siteName: siteConfig.name,
      type: "website",
      locale: dict.meta.ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.pages.about.title} — ${siteConfig.name}`,
      description: dict.pages.about.description,
    },
    alternates: {
      canonical: `/${locale}/about`,
    },
  };
}

export default async function AboutRoute({ params }: Props) {
  const { locale: localeValue } = await params;
  const locale = toLocale(localeValue);
  const dict = getDictionary(locale);
  const url = `${siteConfig.url}/${locale}/about`;

  return (
    <SiteShell>
      <JsonLd
        data={breadcrumbSchema(url, [
          { name: "Home", path: `/${locale}` },
          { name: dict.pages.about.title, path: `/${locale}/about` },
        ])}
      />
      <JsonLd data={organizationSchema(dict)} />
      <JsonLd data={websiteSchema(dict, locale, url)} />
      <AboutPage />
    </SiteShell>
  );
}
