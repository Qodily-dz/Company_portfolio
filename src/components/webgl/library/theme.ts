/* ---------------------------------------------------------------------------
 * Shared visual theme — navy/blue/white palette for all WebGL visuals.
 * Colors are linear-space Float32Arrays for use in GLSL uniforms.
 * ------------------------------------------------------------------------- */

export const palette = {
  /** #030405 — primary background */
  bg: [0.012, 0.016, 0.020] as const,
  /** #0b1018 — surface */
  surface: [0.043, 0.063, 0.094] as const,
  /** #173b68 — accent navy */
  navy: [0.090, 0.231, 0.408] as const,
  /** #2b5c91 — accent blue */
  blue: [0.169, 0.361, 0.569] as const,
  /** #0b1d35 — dim accent */
  dim: [0.043, 0.114, 0.208] as const,
  /** #4a5263 — muted gray */
  gray: [0.290, 0.322, 0.388] as const,
  /** #7d8795 — secondary muted */
  muted: [0.490, 0.529, 0.584] as const,
  /** White */
  white: [1, 1, 1] as const,
} as const;

export type PaletteKey = keyof typeof palette;

/** DPR ceilings per quality tier. */
export const dpr = {
  low: [1, 1.25] as [number, number],
  tablet: [1, 1.5] as [number, number],
  desktop: [1, 1.75] as [number, number],
} as const;
