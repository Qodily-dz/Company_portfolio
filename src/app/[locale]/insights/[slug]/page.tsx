import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteShell } from "@/components/shell/SiteShell";
import { Container } from "@/components/layout";
import { Link } from "@/components/ui";
import { ARTICLES, getArticleBySlug } from "@/lib/insights";
import { siteConfig } from "@/config/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { dateLocales, locales, toLocale, type Locale } from "@/lib/i18n/config";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  articleSchema,
  breadcrumbSchema,
  organizationSchema,
} from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    ARTICLES.map((article) => ({
      locale,
      slug: article.slug,
    })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeValue, slug } = await params;
  const locale = toLocale(localeValue);
  const article = getArticleBySlug(slug);
  const dict = getDictionary(locale);

  if (!article) {
    return { title: "Article Not Found" };
  }

  const translated = dict.articles[slug];
  const title = translated?.title ?? article.title;
  const summary = translated?.summary ?? article.summary;
  const keywords = translated?.keywords ?? article.keywords;
  const url = `${siteConfig.url}/${locale}/insights/${slug}`;

  return {
    title,
    description: summary,
    keywords: [...dict.seo.keywords, ...keywords],
    openGraph: {
      title,
      description: summary,
      url,
      siteName: siteConfig.name,
      type: "article",
      publishedTime: article.date,
      authors: [siteConfig.author],
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
      canonical: `/${locale}/insights/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

function formatDate(iso: string, locale: Locale) {
  return new Date(iso).toLocaleDateString(dateLocales[locale], {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getAdjacentArticles(slug: string) {
  const idx = ARTICLES.findIndex((a) => a.slug === slug);
  const prev = idx > 0 ? ARTICLES[idx - 1] : null;
  const next = idx < ARTICLES.length - 1 ? ARTICLES[idx + 1] : null;
  return { prev, next };
}

export default async function ArticlePage({ params }: Props) {
  const { locale: localeValue, slug } = await params;
  const locale = toLocale(localeValue);
  const article = getArticleBySlug(slug);
  const dict = getDictionary(locale);

  if (!article) {
    notFound();
  }

  const translated = dict.articles[slug];
  const title = translated?.title ?? article.title;
  const summary = translated?.summary ?? article.summary;
  const body = translated?.body ?? article.body;
  const { prev, next } = getAdjacentArticles(slug);
  const prevTranslated = prev ? dict.articles[prev.slug] : null;
  const nextTranslated = next ? dict.articles[next.slug] : null;

  return (
    <SiteShell>
      <JsonLd
        data={breadcrumbSchema(`${siteConfig.url}/${locale}/insights/${slug}`, [
          { name: "Home", path: `/${locale}` },
          { name: dict.insights.label, path: `/${locale}/insights` },
          { name: title, path: `/${locale}/insights/${slug}` },
        ])}
      />
      <JsonLd
        data={articleSchema(locale, dict, article, `${siteConfig.url}/${locale}/insights/${slug}`)}
      />
      <JsonLd data={organizationSchema(dict)} />
      <article className="py-28 md:py-36">
        <Container>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex items-center gap-2 text-xs text-muted-more">
              <li>
                <Link
                  href={`/${locale}`}
                  className="transition-colors hover:text-accent"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={`/${locale}/insights`}
                  className="transition-colors hover:text-accent"
                >
                  {dict.insights.label}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-foreground-soft">
                {title}
              </li>
            </ol>
          </nav>

          {/* Article header */}
          <header className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-accent/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-accent">
                {article.category}
              </span>
              <time
                dateTime={article.date}
                className="text-xs text-muted-more"
              >
                {formatDate(article.date, locale)}
              </time>
              <span className="text-xs text-muted-more">
                {article.readTime}
              </span>
            </div>

            <h1 className="mt-6 text-[clamp(2rem,5vw,3.5rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-foreground">
              {title}
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted">
              {summary}
            </p>
          </header>

          {/* Divider */}
          <div className="my-12 h-px w-full bg-border" />

          {/* Body */}
          <div className="max-w-3xl">
            {body.map((paragraph, i) => (
              <p
                key={i}
                className="text-[clamp(1rem,1.8vw,1.15rem)] leading-[1.8] text-muted"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Article footer note */}
          <div className="mt-16 max-w-3xl border-t border-border pt-8">
            <p className="text-xs leading-relaxed text-muted-more">
              {dict.insights.writtenBy}
            </p>
          </div>

          {/* Prev / Next navigation */}
          <nav
            aria-label="Article navigation"
            className="mt-16 max-w-3xl border-t border-border pt-8"
          >
            <div className="grid gap-8 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={`/${locale}/insights/${prev.slug}`}
                  className="group"
                >
                  <span className="text-xs uppercase tracking-[0.16em] text-muted-more">
                    {dict.common.back}
                  </span>
                  <span className="mt-2 block text-sm font-medium text-foreground transition-colors group-hover:text-accent">
                    {prevTranslated?.title ?? prev.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={`/${locale}/insights/${next.slug}`}
                  className="group text-right"
                >
                  <span className="text-xs uppercase tracking-[0.16em] text-muted-more">
                    Next
                  </span>
                  <span className="mt-2 block text-sm font-medium text-foreground transition-colors group-hover:text-accent">
                    {nextTranslated?.title ?? next.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </nav>

          {/* Back to insights */}
          <div className="mt-12">
            <Link
              href={`/${locale}/insights`}
              className="text-xs uppercase tracking-[0.16em] text-accent hover:text-accent-soft"
            >
              Back to all insights
            </Link>
          </div>
        </Container>
      </article>
    </SiteShell>
  );
}
