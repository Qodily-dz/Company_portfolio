import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteShell } from "@/components/shell/SiteShell";
import { CaseStudyPage } from "@/components/work-page/CaseStudyPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { PROJECTS, getProjectBySlug } from "@/lib/work";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { locales, toLocale } from "@/lib/i18n/config";
import { breadcrumbSchema, organizationSchema } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    PROJECTS.map((project) => ({
      locale,
      slug: project.id,
    })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeValue, slug } = await params;
  const locale = toLocale(localeValue);
  const project = getProjectBySlug(slug);
  const dict = getDictionary(locale);

  if (!project) {
    return { title: "Case Study Not Found" };
  }

  const translated = dict.projects[slug];
  const title = translated?.title ?? project.title;
  const summary = translated?.short ?? project.short;
  const url = `${siteConfig.url}/${locale}/work/${slug}`;

  return {
    title,
    description: summary,
    keywords: [...dict.seo.keywords, project.category, "case study", "portfolio"],
    openGraph: {
      title,
      description: summary,
      url,
      siteName: siteConfig.name,
      type: "website",
      locale: dict.meta.ogLocale,
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: summary,
      images: [siteConfig.ogImage],
    },
    alternates: {
      canonical: `/${locale}/work/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CaseStudyRoute({ params }: Props) {
  const { locale: localeValue, slug } = await params;
  const locale = toLocale(localeValue);
  const project = getProjectBySlug(slug);
  const dict = getDictionary(locale);

  if (!project) {
    notFound();
  }

  const url = `${siteConfig.url}/${locale}/work/${slug}`;
  const translated = dict.projects[slug];
  const title = translated?.title ?? project.title;

  return (
    <SiteShell>
      <JsonLd
        data={breadcrumbSchema(url, [
          { name: dict.common.home, path: `/${locale}` },
          { name: dict.pages.work.title, path: `/${locale}/work` },
          { name: title, path: `/${locale}/work/${slug}` },
        ])}
      />
      <JsonLd data={organizationSchema(dict)} />
      <div
        className="sr-only"
        aria-label={`${dict.work.label} — ${dict.work.concept}`}
      />
      <CaseStudyPage project={project} dict={dict} />
    </SiteShell>
  );
}
