export const colors = {
  background: "#030405",
  secondary: "#070A0F",
  surface: "#0B1018",
  surfaceElevated: "#101722",
  foreground: "#FFFFFF",
  foregroundSoft: "#D5DAE1",
  muted: "#7D8795",
  mutedMore: "#5B6470",
  accent: "#173B68",
  accentSoft: "#2B5C91",
  accentDim: "#0B1D35",
  deepBlue: "#071426",
  darkBlue: "#0B1D35",
  border: "#1A2130",
  borderStrong: "#273247",
} as const;

export const fontFamily = {
  sans: "var(--font-geist-sans), system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "var(--font-geist-mono), ui-monospace, 'SF Mono', Menlo, monospace",
} as const;

export const fontSize = {
  "2xs": "0.6875rem", // 11px
  xs: "0.75rem",       // 12px
  sm: "0.875rem",      // 14px
  base: "1rem",        // 16px
  md: "1.0625rem",     // 17px
  lg: "1.125rem",      // 18px
  xl: "1.25rem",       // 20px
  "2xl": "1.5rem",     // 24px
  "3xl": "1.875rem",   // 30px
  "4xl": "2.25rem",    // 36px
  "5xl": "3rem",       // 48px
  "6xl": "3.75rem",    // 60px
  "7xl": "4.5rem",     // 72px
  "8xl": "6rem",       // 96px
} as const;

export const spacing = {
  0: "0px",
  px: "1px",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  11: "2.75rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  28: "7rem",
  32: "8rem",
  36: "9rem",
  40: "10rem",
  44: "11rem",
  48: "12rem",
  52: "13rem",
  56: "14rem",
  60: "15rem",
  64: "16rem",
  72: "18rem",
  80: "20rem",
  96: "24rem",
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
  "3xl": 1920,
} as const;

export const borderRadius = {
  xs: "0.375rem",
  sm: "0.5rem",
  md: "0.625rem",
  lg: "1rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  full: "9999px",
} as const;

export const zIndex = {
  hide: -1,
  auto: "auto",
  base: 0,
  raised: 1,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

export const maxWidth = {
  xs: "20rem",
  sm: "24rem",
  md: "28rem",
  lg: "32rem",
  xl: "36rem",
  "2xl": "42rem",
  "3xl": "48rem",
  "4xl": "56rem",
  "5xl": "64rem",
  "6xl": "72rem",
  "7xl": "80rem",
  container: "1200px",
  prose: "65ch",
} as const;
