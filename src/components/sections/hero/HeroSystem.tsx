"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SceneCanvas, } from "@/components/webgl/library";
import { usePointerWorld } from "@/components/webgl/library/pointer";
import type { Quality } from "@/lib/webgl-performance";
import { useReducedMotion } from "framer-motion";

/* ---------------------------------------------------------------------------
 * HeroSystem — DATA STREAM / LIVE CODE FIELD.
 *
 * Future-tech backdrop: hundreds of "code particles" flow upward in organized
 * streams like data being compiled and shipped. A glowing core sits centre.
 * The pointer induces a surge/ripple through the field and tilts the whole
 * system — fully interactive, muted under reduced motion.
 *
 * Full-bleed hero background. No drei dependency.
 * ------------------------------------------------------------------------- */

/* GLSL fragment for the code-particle points. */
const FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3  uColor;
  uniform float uAlpha;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float a = smoothstep(0.5, 0.1, d) * vAlpha * uAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSurge;
  uniform vec2  uPointer;
  attribute float aSeed;
  attribute float aSpeed;
  attribute vec3  aColor;
  varying float vAlpha;
  varying vec2  vUv;
  void main() {
    vUv = uv;
    vec3 p = position;

    // Upward flow wrapped in a period.
    float period = 12.0 / aSpeed;
    float t = mod(uTime * aSpeed - uTime * 0.4, 12.0);
    float progress = t / 12.0;
    float yy = mod(p.y + uTime * aSpeed, 13.0) - 6.5;
    p.y = yy;

    // Horizontal drift so streams sway.
    float drift = sin(uTime * 0.4 + aSeed * 6.28) * 0.25;
    p.x += drift;

    // Cursor surge lifts particles near the pointer.
    vec2 dp = vec2(position.x, yy) - uPointer;
    float dist = length(dp);
    float burst = exp(-dist * dist * 1.4) * uSurge;
    p.y += burst * 0.8;
    p.x += dp.x * burst * 0.3;

    // Fade at top/bottom of the stream band.
    float fade = smoothstep(-6.5, -3.5, yy) * (1.0 - smoothstep(3.5, 6.5, yy));
    vAlpha = fade;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = 2.0 + aSpeed * 2.0 + burst * 6.0;
    gl_Position = projectionMatrix * mv;
  }
`;

const COUNT = 900;

function DataField({ quality, reduced }: { quality: Quality; reduced: boolean }) {
  const pointer = usePointerWorld([6, 4]);
  const timeRef = useRef({ uTime: { value: 0 }, uSurge: { value: 0 }, uPointer: { value: new THREE.Vector2() }, uColor: { value: new THREE.Color("#4a8fd8") }, uAlpha: { value: 1 } });
  const groupRef = useRef<THREE.Group>(null);
  const surgeRef = useRef(0);

  /* Immutable particle buffers (pure) */
  const points = useMemo(() => {
    const count = quality === "low" ? 260 : quality === "tablet" ? 520 : COUNT;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const speeds = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const c = new THREE.Color("#4a8fd8");
    const c2 = new THREE.Color("#5fa3e0");
    let seed = 101;
    for (let i = 0; i < count; i++) {
      seed = (seed * 16807) % 2147483647;
      const r = seed / 2147483647;
      positions[i * 3] = (r - 0.5) * 9;
      positions[i * 3 + 1] = (r - 0.5) * 13;
      positions[i * 3 + 2] = (r - 0.5) * 2.5;
      seeds[i] = r;
      seed = (seed * 16807) % 2147483647;
      speeds[i] = 0.4 + (seed / 2147483647) * 1.4;
      const col = r > 0.72 ? c2 : c;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [quality]);

  useFrame((_, delta) => {
    const U = timeRef.current;
    if (reduced) {
      U.uTime.value += delta;
      return;
    }
    U.uTime.value += delta;
    U.uPointer.value.set(pointer.current.worldX, pointer.current.worldY);
    surgeRef.current = THREE.MathUtils.damp(surgeRef.current, pointer.current.velocity, 4, delta);
    U.uSurge.value = surgeRef.current;

    const g = groupRef.current;
    if (g) {
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, pointer.current.worldY * 0.02, delta * 2);
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.1} />
      <points geometry={points} frustumCulled={false}>
        <shaderMaterial
          vertexShader={VERT}
          fragmentShader={FRAG}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          // eslint-disable-next-line react-hooks/refs
          uniforms={timeRef.current as unknown as Record<string, never>}
        />
      </points>
    </group>
  );
}

/* ------------------------------------------------------------------ */

const FALLBACK = (
  <div className="h-full w-full bg-[radial-gradient(90%_80%_at_30%_40%,#0b1018_0%,#030405_70%)]" />
);

export function HeroSystem() {
  const reduced = useReducedMotion();
  return (
    <SceneCanvas
      camera={[0, 0, 8]}
      fov={45}
      far={30}
      fallback={FALLBACK}
      quality={reduced ? "low" : undefined}
      reduced={reduced ?? undefined}
      background="#030405"
    >
      {(ctx) => (
        <DataField quality={ctx.quality} reduced={ctx.reduced || !!reduced} />
      )}
    </SceneCanvas>
  );
}
