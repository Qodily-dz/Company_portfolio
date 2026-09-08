import { ImageResponse } from "next/og";

export const alt = "Qodily — Digital Solutions Agency";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#030405",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: "#2b6cb5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            Q
          </div>
          <span
            style={{
              fontSize: "28px",
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Qodily
          </span>
        </div>

        <div
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: "24px",
            display: "flex",
          }}
        >
          Build. Design. Grow.
        </div>

        <div
          style={{
            fontSize: "24px",
            color: "#8c96a6",
            lineHeight: 1.4,
            maxWidth: "800px",
            display: "flex",
          }}
        >
          From idea to impact — digital solutions for businesses, startups and
          entrepreneurs.
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "80px",
            right: "80px",
            fontSize: "18px",
            color: "#6b7686",
            display: "flex",
          }}
        >
          qodily.dz
        </div>
      </div>
    ),
    { ...size },
  );
}