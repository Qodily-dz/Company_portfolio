"use client";

import { Container } from "@/components/layout";
import { Link, SectionLabel } from "@/components/ui";
import { ContactRequests } from "@/components/contact/ContactRequests";
import { siteConfig } from "@/config/site";
import { useTranslations } from "@/lib/i18n";

/**
 * Dedicated /contact page — a focused conversion environment. The interactive
 * project questionnaire sits on a calm surface, with direct contact and trust
 * signals alongside. This page owns a clear, quiet personality.
 */
export function ContactPage() {
  const dict = useTranslations();

  return (
    <div aria-label={dict.pages.contact.title}>
      {/* Intro */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(100%_80%_at_50%_0%,#0b1018_0%,#030405_65%)]" />
        <Container className="relative z-10">
          <SectionLabel>{dict.pages.contact.title}</SectionLabel>
          <h1 className="mt-6 max-w-4xl text-[clamp(2.6rem,9vw,7rem)] font-medium uppercase leading-[0.92] tracking-[-0.03em] text-foreground">
            {dict.contact.heading1}
            <span className="block text-accent">{dict.contact.heading2Accent}</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
            {dict.pages.contact.intro}
          </p>
          <p className="mt-4 text-sm text-muted-more">{dict.pages.contact.reply}</p>
        </Container>
      </section>

      {/* Questionnaire + direct details */}
      <section className="border-t border-border py-20 md:py-28">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_280px] lg:gap-16">
            <ContactRequests />

            {/* Direct contact */}
            <aside className="flex flex-col gap-8">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                  {dict.pages.contact.detailsHeading}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <Link href={`mailto:${siteConfig.email}`} external className="text-sm text-muted hover:text-foreground">
                    {siteConfig.email}
                  </Link>
                  <Link href={siteConfig.whatsapp} external className="text-sm text-muted hover:text-foreground">
                    WhatsApp
                  </Link>
                  <span className="text-sm text-muted">
                    {siteConfig.address.city}, {siteConfig.address.country}
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                  {dict.about.values}
                </div>
                <ul className="mt-4 flex flex-col gap-3 text-sm text-muted">
                  {dict.about.valuesList.slice(0, 3).map((v: { name: string }) => (
                    <li key={v.name} className="flex items-baseline gap-3">
                      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{v.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </div>
  );
}
