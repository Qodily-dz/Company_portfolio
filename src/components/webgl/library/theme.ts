/* ---------------------------------------------------------------------------
 * Shared visual theme — navy/blue/white palette for all WebGL visuals.
 * Colors are linear-space Float32Arrays for use in GLSL uniforms.
 * ------------------------------------------------------------------------- */

export const palette = {
  /** #030405 — primary background */
  bg: [0.012, 0.016, 0.020] as const,
  /** #0b1018 — surface */
  surface: [0.043, 0.063, 0.094] as const,
  /** #2b6cb5 — vivid accent navy */
  navy: [0.169, 0.424, 0.710] as const,
  /** #4a8fd8 — vivid accent blue */
  blue: [0.290, 0.561, 0.847] as const,
  /** #142a4a — dim accent */
  dim: [0.078, 0.165, 0.290] as const,
  /** #3c4a60 — muted gray */
  gray: [0.235, 0.290, 0.376] as const,
  /** #8c96a6 — secondary muted */
  muted: [0.549, 0.588, 0.651] as const,
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
