"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/layout";
import { Button, SectionLabel } from "@/components/ui";
import { useLocale, useTranslations } from "@/lib/i18n";

type PublicPack = {
  id: string;
  name: string;
  description: string;
  deliverables: string[];
  price: number | null;
  priceLabel: string;
  currency: string;
  period: string;
  featured: boolean;
};

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

function localizePeriod(period: string, locale: string): string {
  const norm = period.trim().toLowerCase();
  if (norm === "one-off" || norm === "unique" || norm === "one time") {
    if (locale === "fr") return "paiement unique";
    if (locale === "ar") return "دفعة واحدة";
    return "one-off";
  }
  if (norm === "per month" || norm === "month" || norm === "/ month" || norm === "/ mois") {
    if (locale === "fr") return "par mois";
    if (locale === "ar") return "شهرياً";
    return "per month";
  }
  if (norm === "project" || norm === "per project") {
    if (locale === "fr") return "par projet";
    if (locale === "ar") return "لكل مشروع";
    return "project";
  }
  return period;
}

/**
 * Fixed-price service packs, loaded live from the backend so the catalogue
 * can be managed without touching the codebase. Rendered only when the
 * connection fails gracefully into a quiet placeholder.
 */
export function ServicePacks() {
  const dict = useTranslations();
  const locale = useLocale();
  const [packs, setPacks] = useState<PublicPack[] | null>(null);

  useEffect(() => {
    if (!API) return;
    let alive = true;
    fetch(`${API}/api/packs?locale=${locale}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { data: PublicPack[] }) => {
        if (alive) setPacks(data.data || []);
      })
      .catch(() => {
        if (alive) setPacks([]);
      });
    return () => {
      alive = false;
    };
  }, [locale]);

  return (
    <section className="border-t border-border py-20 md:py-28" aria-label={dict.services.packsLabel}>
      <Container>
        <div className="max-w-2xl">
          <SectionLabel>{dict.services.packsLabel}</SectionLabel>
          <h2 className="mt-5 text-[clamp(2rem,5vw,3.4rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-foreground">
            {dict.services.packsIntro.split(". ")[0]}.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">{dict.services.packsIntro}</p>
        </div>

        {packs && packs.length > 0 && (
          <>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {packs.map((p) => (
                <article
                  key={p.id}
                  data-cursor="link"
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-colors duration-300 ${
                    p.featured
                      ? "border-accent/50 bg-accent/[0.06]"
                      : "border-border bg-surface/40 hover:border-border-strong"
                  }`}
                >
                  {p.featured && (
                    <span className="absolute right-0 top-0 z-10 rounded-bl-xl border-b border-l border-accent/40 bg-accent/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-accent rtl:right-auto rtl:left-0 rtl:rounded-bl-none rtl:rounded-br-xl rtl:border-l-0 rtl:border-r">
                      ★
                    </span>
                  )}

                  <div className="flex flex-1 flex-col gap-5 p-7 md:p-8">
                    <div>
                      <h3 className="text-lg font-medium uppercase tracking-[-0.01em] text-foreground">
                        {p.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{p.description}</p>
                    </div>

                    <div className="flex items-baseline gap-2">
                      {p.price === null ? (
                        <span className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
                          {(!p.priceLabel || p.priceLabel.toLowerCase() === "custom")
                            ? dict.services.customLabel
                            : p.priceLabel}
                        </span>
                      ) : (
                        <span className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
                          {dict.services.fromLabel} {p.currency}
                          {p.price}
                        </span>
                      )}
                      {p.period && p.price !== null && (
                        <span className="text-xs text-muted-more">{localizePeriod(p.period, locale)}</span>
                      )}
                    </div>

                    <ul className="mt-2 flex flex-col gap-2.5">
                      {p.deliverables.slice(0, 6).map((d) => (
                        <li key={d} className="flex items-start gap-2.5 text-sm text-foreground-soft">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-7 pt-0 md:p-8 md:pt-0">
                    <Button
                      href={`/${locale}/contact`}
                      size="sm"
                      variant={p.featured ? "primary" : "outline"}
                      className="w-full"
                    >
                      {dict.services.choosePack}
                      <span aria-hidden className="inline-block rtl:rotate-180">→</span>
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            <p className="mt-8 max-w-xl text-xs leading-relaxed text-muted-more">
              {dict.services.packsNote}
            </p>
          </>
        )}
      </Container>
    </section>
  );
}