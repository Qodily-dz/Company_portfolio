import type { Metadata } from "next";
import { SiteShell } from "@/components/shell/SiteShell";
import { WorkPage } from "@/components/work-page/WorkPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { locales, toLocale } from "@/lib/i18n/config";
import { breadcrumbSchema, organizationSchema } from "@/lib/seo";

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
    title: dict.pages.work.title,
    description: dict.pages.work.description,
    keywords: [...dict.seo.keywords, "portfolio", "case studies", "digital products"],
    openGraph: {
      title: `${dict.pages.work.title} — ${siteConfig.name}`,
      description: dict.pages.work.description,
      url: `${siteConfig.url}/${locale}/work`,
      siteName: siteConfig.name,
      type: "website",
      locale: dict.meta.ogLocale,
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.pages.work.title} — ${siteConfig.name}`,
      description: dict.pages.work.description,
      images: [siteConfig.ogImage],
    },
    alternates: {
      canonical: `/${locale}/work`,
    },
  };
}

export default async function WorkRoute({ params }: Props) {
  const { locale: localeValue } = await params;
  const locale = toLocale(localeValue);
  const dict = getDictionary(locale);
  const url = `${siteConfig.url}/${locale}/work`;

  return (
    <SiteShell>
      <JsonLd
        data={breadcrumbSchema(url, [
          { name: "Home", path: `/${locale}` },
          { name: dict.pages.work.title, path: `/${locale}/work` },
        ])}
      />
      <JsonLd data={organizationSchema(dict)} />
      <WorkPage />
    </SiteShell>
  );
}
