import type { Metadata } from "next";
import { SiteShell } from "@/components/shell/SiteShell";
import { ContactPage } from "@/components/contact-page/ContactPage";
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
    title: dict.pages.contact.title,
    description: dict.pages.contact.description,
    keywords: [...dict.seo.keywords, "contact", "start a project", "get in touch"],
    openGraph: {
      title: `${dict.pages.contact.title} — ${siteConfig.name}`,
      description: dict.pages.contact.description,
      url: `${siteConfig.url}/${locale}/contact`,
      siteName: siteConfig.name,
      type: "website",
      locale: dict.meta.ogLocale,
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.pages.contact.title} — ${siteConfig.name}`,
      description: dict.pages.contact.description,
      images: [siteConfig.ogImage],
    },
    alternates: {
      canonical: `/${locale}/contact`,
    },
  };
}

export default async function ContactRoute({ params }: Props) {
  const { locale: localeValue } = await params;
  const locale = toLocale(localeValue);
  const dict = getDictionary(locale);
  const url = `${siteConfig.url}/${locale}/contact`;

  return (
    <SiteShell>
      <JsonLd
        data={breadcrumbSchema(url, [
          { name: "Home", path: `/${locale}` },
          { name: dict.pages.contact.title, path: `/${locale}/contact` },
        ])}
      />
      <JsonLd data={organizationSchema(dict)} />
      <ContactPage />
    </SiteShell>
  );
}
