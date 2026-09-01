import { SiteShell } from "@/components/shell/SiteShell";
import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { Story } from "@/components/sections/story";
import { Transformation } from "@/components/sections/transformation";
import { Work } from "@/components/sections/work";
import { Engineering } from "@/components/sections/engineering";
import { Process } from "@/components/sections/process";
import { Grow } from "@/components/sections/growth";
import { Insights } from "@/components/sections/insights";
import { Lab } from "@/components/sections/lab";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
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
      <Services />
      <Story />
      <Transformation />
      <Work />
      <Engineering />
      <Process />
      <Grow />
      <Insights />
      <Lab />
      <About />
      <Contact />
    </SiteShell>
  );
}