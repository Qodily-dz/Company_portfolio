import type { Metadata } from "next";
import { SiteShell } from "@/components/shell/SiteShell";
import { Container } from "@/components/layout";
import { SectionLabel } from "@/components/ui";
import { Process } from "@/components/sections/process";
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
    title: dict.pages.process.title,
    description: dict.pages.process.description,
    keywords: [...dict.seo.keywords, "process", "digital product process", "how we work"],
    openGraph: {
      title: `${dict.pages.process.title} — ${siteConfig.name}`,
      description: dict.pages.process.description,
      url: `${siteConfig.url}/${locale}/process`,
      siteName: siteConfig.name,
      type: "website",
      locale: dict.meta.ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.pages.process.title} — ${siteConfig.name}`,
      description: dict.pages.process.description,
    },
    alternates: {
      canonical: `/${locale}/process`,
    },
  };
}

export default async function ProcessRoute({ params }: Props) {
  const { locale: localeValue } = await params;
  const locale = toLocale(localeValue);
  const dict = getDictionary(locale);
  const url = `${siteConfig.url}/${locale}/process`;

  return (
    <SiteShell>
      <JsonLd
        data={breadcrumbSchema(url, [
          { name: "Home", path: `/${locale}` },
          { name: dict.pages.process.title, path: `/${locale}/process` },
        ])}
      />
      <JsonLd data={organizationSchema(dict)} />
      {/* Page intro */}
      <section className="relative overflow-hidden pt-24 md:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(100%_80%_at_50%_0%,#0b1018_0%,#030405_65%)]" />
        <Container className="relative z-10">
          <SectionLabel>{dict.pages.process.title}</SectionLabel>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.6rem,9vw,7rem)] font-medium uppercase leading-[0.92] tracking-[-0.03em] text-foreground">
            {dict.process.heading1}
            <span className="block text-accent">{dict.process.heading2}</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
            {dict.pages.process.intro}
          </p>
        </Container>
      </section>
      {/* The sequential interactive process */}
      <Process />
    </SiteShell>
  );
}
