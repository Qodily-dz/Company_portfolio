import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { notoSansArabic } from "./fonts";
import { siteConfig } from "@/config/site";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { I18nProvider } from "./i18n-provider";
import { Plausible } from "@/components/analytics/Plausible";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isRtl, ogLocales, toLocale } from "@/lib/i18n/config";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

type LayoutMetaProps = {
  params: Promise<{ locale: string }>;
};

export const viewport: Viewport = {
  themeColor: "#030405",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: LayoutMetaProps): Promise<Metadata> {
  const { locale: localeValue } = await params;
  const locale = toLocale(localeValue);
  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: dict.meta.title,
      template: `%s — ${siteConfig.name}`,
    },
    description: dict.meta.description,
    keywords: [...dict.seo.keywords],
    authors: [{ name: siteConfig.author }],
    openGraph: {
      type: "website",
      locale: dict.meta.ogLocale,
      alternateLocale: Object.values(ogLocales).filter((l) => l !== dict.meta.ogLocale),
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: dict.meta.title,
      description: dict.meta.description,
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: [siteConfig.ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale: localeValue } = await params;
  const locale = toLocale(localeValue);
  const dict = getDictionary(locale);
  const rtl = isRtl(locale);

  return (
    <html
      lang={locale}
      dir={rtl ? "rtl" : "ltr"}
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansArabic} scrollbar-thin antialiased`}
      suppressHydrationWarning
    >
      <head>
        {process.env.NODE_ENV === "production" && <Plausible />}
      </head>
      <body className="min-h-full bg-background text-foreground" suppressHydrationWarning>
        <MotionConfig reducedMotion="user">
          <TooltipProvider>
            <I18nProvider locale={locale} dict={dict}>
              {children}
            </I18nProvider>
          </TooltipProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
