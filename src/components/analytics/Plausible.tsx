import Script from "next/script";

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export function Plausible() {
  if (!PLAUSIBLE_DOMAIN) return null;

  return (
    <Script
      data-domain={PLAUSIBLE_DOMAIN}
      src="https://plausible.io/js/script.tagged-events.js"
      strategy="afterInteractive"
    />
  );
}
