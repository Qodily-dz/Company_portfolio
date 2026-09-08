/**
 * Analytics event tracking for Qodily.
 *
 * This module centralizes all analytics. UI components call the small
 * `track` helpers below rather than importing an analytics SDK directly,
 * so the provider can be wired up or swapped in one place without touching
 * the UI.
 *
 * The default implementation is a no-op with console logging disabled by
 * default. To enable a real provider, set handlers in `trackProviders` or
 * replace the body of `dispatch`. No analytics calls are hardcoded across
 * the UI — everything routes through `track`.
 */

/** Events tracked across the site (all optional — only fire when raised). */
export type TrackEvent =
  | "contact_started"
  | "service_selected"
  | "contact_completed"
  | "whatsapp_clicked"
  | "cta_clicked";

export type TrackProperties = Record<string, unknown>;

const ENABLE_DEBUG = process.env.NODE_ENV === "development" && false;

type PlausibleFn = (event: string, props?: Record<string, unknown>) => void;

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

/** Register providers here (e.g. window.dataLayer, gtag, posthog, ...). */
const trackProviders: ((event: TrackEvent, props?: TrackProperties) => void)[] = [];

/**
 * Provider that forwards tracked events to Plausible as tagged custom events.
 * Uses `plausible('event', { props })` with automatic custom props (the
 * script.tagged-events build is loaded in the root layout).
 */
trackProviders.push((event, props) => {
  if (typeof window === "undefined" || !window.plausible) return;
  try {
    window.plausible(event, { props: props ?? {} });
  } catch {
    /* ignore */
  }
});

/**
 * Fires a tracked event to all registered providers.
 * Safe to call anywhere; never throws.
 */
export function track(event: TrackEvent, properties?: TrackProperties) {
  try {
    if (ENABLE_DEBUG) {
      console.info("[analytics]", event, properties ?? {});
    }
    trackProviders.forEach((provider) => provider(event, properties ?? {}));
  } catch {
    /* analytics must never break the UI */
  }
}

/** Convenience: raise cta_clicked for primary CTAs (e.g. START A PROJECT). */
export function trackCta(properties?: TrackProperties) {
  track("cta_clicked", properties);
}

/** Convenience: raise whatsapp_clicked with the target number. */
export function trackWhatsapp(properties?: TrackProperties) {
  track("whatsapp_clicked", properties);
}
