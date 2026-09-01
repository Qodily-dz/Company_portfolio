"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout";
import { Link, SectionLabel } from "@/components/ui";
import {
  ARTICLES,
} from "@/lib/insights";
import { useTranslations, useLocale } from "@/lib/i18n";
import { dateLocales } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";

const EASE = [0.16, 1, 0.3, 1] as const;

function formatDate(iso: string, locale: Locale) {
  return new Date(iso).toLocaleDateString(dateLocales[locale], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Insights() {
  const dict = useTranslations();
  const locale = useLocale();

  return (
    <section
      id="insights"
      className="relative overflow-hidden py-28 md:py-36"
      aria-label="Insights — articles from the Qodily team"
    >
      <Container>
        <div className="max-w-4xl">
          <SectionLabel>{dict.insights.label}</SectionLabel>
          <h2 className="mt-6 text-[clamp(2.6rem,8vw,6.5rem)] font-medium uppercase leading-[0.9] tracking-[-0.03em] text-foreground">
            <span className="block">{dict.insights.heading1}</span>
            <span className="block text-accent">{dict.insights.heading2}</span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
            {dict.insights.note}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {[
              "Technology",
              "Software",
              "Business",
              "Design",
              "Marketing",
              "Digital Transformation",
            ].map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-border bg-surface/40 px-3.5 py-1.5 text-xs text-muted"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          className="mt-16 border-b border-border/60"
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
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
        </motion.div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-more">
          <span>{dict.insights.writtenBy}</span>
          <Link
            href={`/${locale}/insights`}
            className="text-xs uppercase tracking-[0.16em] text-accent hover:text-accent-soft"
          >
            {dict.insights.viewAll}
          </Link>
        </div>
      </Container>
    </section>
  );
}
