import type { Metadata } from "next";
import { SiteShell } from "@/components/shell/SiteShell";
import { Container } from "@/components/layout";
import { Link, SectionLabel } from "@/components/ui";
import { ARTICLES, CATEGORIES } from "@/lib/insights";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { dateLocales, locales, toLocale, type Locale } from "@/lib/i18n/config";
import { JsonLd } from "@/components/seo/JsonLd";
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
  const url = `${siteConfig.url}/${locale}/insights`;

  return {
    title: dict.insights.heading1 + " " + dict.insights.heading2,
    description: dict.insights.note,
    keywords: [
      ...dict.seo.keywords,
      "tech insights",
      "software engineering blog",
      "digital business articles",
    ],
    openGraph: {
      title: `${dict.insights.label} — ${siteConfig.name}`,
      description: dict.insights.note,
      url,
      siteName: siteConfig.name,
      type: "website",
      locale: dict.meta.ogLocale,
    },
    twitter: {
      card: "summary_large_image",
      title: `${dict.insights.label} — ${siteConfig.name}`,
      description: dict.insights.note,
    },
    alternates: {
      canonical: `/${locale}/insights`,
    },
  };
}

function formatDate(iso: string, locale: Locale) {
  return new Date(iso).toLocaleDateString(dateLocales[locale], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function InsightsPage({ params }: Props) {
  const { locale: localeValue } = await params;
  const locale = toLocale(localeValue);
  const dict = getDictionary(locale);
  const url = `${siteConfig.url}/${locale}/insights`;

  return (
    <SiteShell>
      <JsonLd
        data={breadcrumbSchema(url, [
          { name: "Home", path: `/${locale}` },
          { name: dict.insights.label, path: `/${locale}/insights` },
        ])}
      />
      <JsonLd data={organizationSchema(dict)} />
      <section className="py-28 md:py-36">
        <Container>
          {/* Header */}
          <div className="max-w-4xl">
            <SectionLabel>{dict.insights.label}</SectionLabel>
            <h1 className="mt-6 text-[clamp(2.6rem,8vw,6.5rem)] font-medium uppercase leading-[0.9] tracking-[-0.03em] text-foreground">
              <span className="block">{dict.insights.heading1}</span>
              <span className="block text-accent">{dict.insights.heading2}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
              {dict.insights.note}
            </p>

            {/* Category pills */}
            <div className="mt-8 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full border border-border bg-surface/40 px-3.5 py-1.5 text-xs text-muted"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Article list */}
          <div className="mt-16 border-b border-border/60">
            {ARTICLES.map((article, i) => {
              const translated = dict.articles[article.slug];
              const title = translated?.title ?? article.title;
              const summary = translated?.summary ?? article.summary;

              return (
                <div key={article.slug} className="border-t border-border/60">
                  <Link
                    href={`/${locale}/insights/${article.slug}`}
                    className="group flex w-full items-start gap-5 py-6 text-left md:items-center md:py-7"
                  >
                    <span className="hidden w-10 shrink-0 font-mono text-sm tabular-nums text-muted-more md:block">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="shrink-0 rounded-full border border-accent/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-accent">
                      {article.category}
                    </span>
                    <span className="flex-1">
                      <span className="block text-[clamp(1.3rem,3vw,2rem)] font-medium leading-tight tracking-[-0.02em] text-foreground transition-colors group-hover:text-accent">
                        {title}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted">
                        {summary}
                      </span>
                    </span>
                    <span className="hidden shrink-0 flex-col items-end text-xs text-muted-more sm:flex">
                      <span>{formatDate(article.date, locale)}</span>
                      <span>{article.readTime}</span>
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-6 text-xs text-muted-more">
            {dict.insights.writtenBy}
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
