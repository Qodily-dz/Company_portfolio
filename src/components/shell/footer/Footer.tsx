"use client";

import { siteConfig } from "@/config/site";
import { Container } from "@/components/layout";
import { Link, Divider } from "@/components/ui";
import { UnderlineFollow, ScrambleText } from "@/components/interactions";
import { Logo } from "@/components/brand/Logo";
import { getMainNav, getPillars, socialLinks } from "@/lib/navigation";
import { useTranslations, useLocale } from "@/lib/i18n";

export function Footer() {
  const dict = useTranslations();
  const locale = useLocale();
  const year = new Date().getFullYear();
  const navItems = getMainNav(dict, locale);
  const pillarItems = getPillars(dict, locale);

  return (
    <footer className="border-t border-border bg-secondary">
      <Container className="py-16 md:py-20">
        {/* Top: brand + tagline */}
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex">
              <Logo />
            </Link>
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.12em] text-muted">
              {dict.hero.headline1} {dict.hero.headline2} {dict.hero.headlineAccent}
            </p>
          </div>

          {/* Pillars */}
          <nav aria-label="Capabilities" className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-more">
              {dict.footer.capabilities}
            </p>
            {pillarItems.map((p) => (
              <UnderlineFollow
                key={p.href}
                href={p.href}
                className="text-sm text-muted"
              >
                {p.label}
              </UnderlineFollow>
            ))}
          </nav>

          {/* Main nav */}
          <nav aria-label="Footer navigation" className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-more">
              {dict.footer.company}
            </p>
            {navItems.map((item) => (
              <UnderlineFollow
                key={item.href}
                href={item.href}
                className="text-sm text-muted"
              >
                {item.label}
              </UnderlineFollow>
            ))}
          </nav>

          {/* Contact + social */}
          <div className="flex flex-col gap-3 md:items-end">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-more">
              {dict.footer.getInTouch}
            </p>
            <Link href={`mailto:${siteConfig.email}`} external className="text-sm text-muted hover:text-foreground">
              {siteConfig.email}
            </Link>
            <Link href={siteConfig.whatsapp} external className="text-sm text-muted hover:text-foreground">
              WhatsApp
            </Link>
            <p className="text-sm text-muted">
              {siteConfig.address.city}, {siteConfig.address.country}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
              {socialLinks.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  external
                  className="text-sm text-muted hover:text-foreground"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Divider className="mt-14" />

        {/* Bottom bar */}
        <div className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-more">
            © {year} {siteConfig.legalName}. {dict.footer.allRights}
          </p>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-more">
            <ScrambleText
              text={siteConfig.positioning}
              className="inline"
            />
          </p>
        </div>
      </Container>
    </footer>
  );
}
