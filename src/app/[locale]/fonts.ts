import { Noto_Sans_Arabic } from "next/font/google";

const notoSansArabicFont = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  // Only Arabic pages render Arabic glyphs — avoid preloading it on the
  // Latin (en/fr) layouts where it would never be used.
  preload: false,
});

export const notoSansArabic = notoSansArabicFont.variable;
