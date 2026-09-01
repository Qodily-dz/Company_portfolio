import type { Locale } from "./config";
import type { Dictionary } from "./types";
import { en } from "@/messages/en";
import { fr } from "@/messages/fr";
import { ar } from "@/messages/ar";

const dictionaries: Record<Locale, Dictionary> = { en, fr, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
