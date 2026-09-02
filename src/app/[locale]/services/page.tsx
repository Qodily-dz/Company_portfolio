import type { Metadata } from "next";
import { SiteShell } from "@/components/shell/SiteShell";
import { ServicesPage } from "@/components/services-page/ServicesPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { locales, toLocale } from "@/lib/i18n/config";
import { breadcrumbSchema, servicesSchema } from "@/lib/seo";

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
    title: dict.pages.services.title,
    description: dict.pages.services.description,
    keywords: [...dict.seo.keywords, "services", "web development", "design", "digital marketing"],
    openGraph: {
      title: `${dict.pages.services.title} — ${siteConfig.name}`,
      description: dict.pages.services.description,
      url: `${siteConfig.url}/${locale}/services`,
      siteName: siteConfig.name,
      type: "website",
      locale: dict.meta.ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.pages.services.title} — ${siteConfig.name}`,
      description: dict.pages.services.description,
    },
    alternates: {
      canonical: `/${locale}/services`,
    },
  };
}

export default async function ServicesRoute({ params }: Props) {
  const { locale: localeValue } = await params;
  const locale = toLocale(localeValue);
  const dict = getDictionary(locale);
  const url = `${siteConfig.url}/${locale}/services`;

  return (
    <SiteShell>
      <JsonLd
        data={breadcrumbSchema(url, [
          { name: "Home", path: `/${locale}` },
          { name: dict.pages.services.title, path: `/${locale}/services` },
        ])}
      />
      {servicesSchema(dict, url).map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      <ServicesPage />
    </SiteShell>
  );
}
