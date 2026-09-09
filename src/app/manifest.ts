import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Qodily — Digital Solutions Agency",
    short_name: "Qodily",
    description:
      "Qodily-dz builds software, digital experiences and growth solutions for businesses, startups and entrepreneurs.",
    start_url: "/en",
    display: "standalone",
    background_color: "#030405",
    theme_color: "#030405",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
