import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n/config";

/**
 * Device-language detection. A visitor landing on the bare root is redirected
 * to the locale that best matches their `Accept-Language` header (e.g. a
 * device set to French hits `/fr`, Arabic hits `/ar`). Everything else keeps
 * the requested path and locale prefix untouched.
 */
function pickLocale(request: NextRequest): string {
  const accept = request.headers.get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const raw = part.trim().split(";")[0].trim();
    if (!raw) continue;
    const lang = raw.split("-")[0].toLowerCase();
    if ((locales as readonly string[]).includes(lang)) {
      return lang;
    }
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const locale = pickLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: "/",
};