/* ---------------------------------------------------------------------------
 * Shared GLSL snippets — hash, noise, fbm functions injected into
 * visual shaders so we never duplicate them across scenes.
 * All visuals share the same procedural noise base.
 * ------------------------------------------------------------------------- */

/** 3-input hash (returns 0..1). */
export const HASH31 = /* glsl */ `
float hash31(vec3 p){
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
`;

/** 3D value noise (returns 0..1). */
export const NOISE3 = /* glsl */ `
float noise3(vec3 p){
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash31(i+vec3(0,0,0)), hash31(i+vec3(1,0,0)), f.x),
        mix(hash31(i+vec3(0,1,0)), hash31(i+vec3(1,1,0)), f.x), f.y),
    mix(mix(hash31(i+vec3(0,0,1)), hash31(i+vec3(1,0,1)), f.x),
        mix(hash31(i+vec3(0,1,1)), hash31(i+vec3(1,1,1)), f.x), f.y),
    f.z);
}
`;

/** Fractal Brownian Motion (4 octaves). */
export const FBM3 = /* glsl */ `
float fbm3(vec3 p){
  return noise3(p) * 0.55
       + noise3(p*2.02) * 0.25
       + noise3(p*4.04) * 0.13
       + noise3(p*8.08) * 0.07;
}
`;

/** Full noise library — concatenation of hash + noise + fbm. */
export const NOISE_LIB = HASH31 + NOISE3 + FBM3;

/** 2D simplex noise (for grid-based visuals). */
export const NOISE2D = /* glsl */ `
float hash2(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise2(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash2(i), hash2(i + vec2(1,0)), f.x),
    mix(hash2(i + vec2(0,1)), hash2(i + vec2(1,1)), f.x),
    f.y);
}
`;
