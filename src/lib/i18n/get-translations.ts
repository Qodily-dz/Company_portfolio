import type { Locale } from "./config";
import { getDictionary } from "./dictionaries";

/**
 * Server-side helper. Call from Server Components or generateMetadata:
 *
 *   const t = await getTranslations(locale);
 *   return { title: t.meta.title };
 */
export async function getTranslations(locale: Locale) {
  return getDictionary(locale);
}
