import { SiteShell } from "@/components/shell/SiteShell";
import { Hero } from "@/components/sections/hero";
import { Story } from "@/components/sections/story";
import {
  ServicesPreview,
  WorkPreview,
  ProcessPreview,
  AboutPreview,
  FinalCta,
} from "@/components/home";
import { JsonLd } from "@/components/seo/JsonLd";
import { defaultLocale, locales, toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { siteConfig } from "@/config/site";
import {
  organizationSchema,
  websiteSchema,
  servicesSchema,
} from "@/lib/seo";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<import("next").Metadata> {
  const { locale: localeValue } = await params;
  const locale = toLocale(localeValue);
  const languages: Record<string, string> = { "x-default": "/" };
  for (const l of locales) {
    languages[l] = l === defaultLocale ? "/" : `/${l}`;
  }
  return {
    alternates: {
      canonical: locale === defaultLocale ? "/" : `/${locale}`,
      languages,
    },
  };
}

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeValue } = await params;
  const locale = toLocale(localeValue);
  const dict = getDictionary(locale);
  const url = `${siteConfig.url}/${locale}`;
  const seo = [
    organizationSchema(dict),
    websiteSchema(dict, locale, url),
    ...servicesSchema(dict, url),
  ];

  return (
    <SiteShell>
      {seo.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      <Hero />
      {/* 02 Short statement */}
      <Story />
      {/* 03 BUILD / DESIGN / GROW */}
      <ServicesPreview />
      {/* 04 Selected work */}
      <WorkPreview />
      {/* 05 How we work */}
      <ProcessPreview />
      {/* 06 About / vision */}
      <AboutPreview />
      {/* 07 Final CTA */}
      <FinalCta />
    </SiteShell>
  );
}