import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, type Locale } from "@/lib/i18n/config";

const COOKIE_NAME = "NEXT_LOCALE";

function getLocaleFromPathname(pathname: string): Locale | null {
  const seg = pathname.split("/")[1];
  if (seg && (locales as readonly string[]).includes(seg)) {
    return seg as Locale;
  }
  return null;
}

function stripLocale(pathname: string): string {
  const locale = getLocaleFromPathname(pathname);
  return locale ? pathname.slice(locale.length + 1) || "/" : pathname;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/opengraph-image") ||
    pathname.startsWith("/twitter-image") ||
    pathname === "/icon" ||
    pathname === "/apple-icon" ||
    pathname === "/manifest.webmanifest"
  ) {
    return NextResponse.next();
  }

  const urlLocale = getLocaleFromPathname(pathname);
  const stripped = stripLocale(pathname);

  if (urlLocale) {
    const response = NextResponse.next();
    response.cookies.set(COOKIE_NAME, urlLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value as Locale | undefined;
  const detected = cookieLocale && (locales as readonly string[]).includes(cookieLocale)
    ? cookieLocale
    : defaultLocale;

  const newPath = detected === defaultLocale && stripped === "/"
    ? "/"
    : `/${detected}${stripped === "/" ? "" : stripped}`;

  if (newPath === pathname) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = newPath;
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|opengraph-image|twitter-image|icon|apple-icon|manifest.webmanifest|.*\\..*).*)",
  ],
};
