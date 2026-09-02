"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { NOISE_LIB } from "./shaders";
import { buildPointBuffers, pointBuffersToGeometry } from "./geometry";
import { usePointerWorld } from "./pointer";
import { palette } from "./theme";
import { useScrollVelocity } from "@/lib/motion/useScrollVelocity";

/* ---------------------------------------------------------------------------
 * MorphingGrid — MORPHING GRID / morphing matter.
 *
 * One persistent particle system whose geometry morphs between N states as
 * `morph` (0..N-1) changes. Ideal for BUILD → DESIGN → GROW style
 * transformations: the same digital matter rearranges, never a hard cut.
 *
 * Each state supplies a position function + a color (state bodies are GLSL
 * strings; the primitive composes the crossfade weights, camera pullback,
 * mouse swirl, idle drift and fade).
 * ------------------------------------------------------------------------- */

export type MorphState = {
  /** GLSL body defining `vec3 runK(vec3 ipos, float seed, float tm)`. */
  body: string;
  /** State hex color used while this state dominates the blend. */
  color: string;
  /** Optional GLSL body defining `vec3 intK(vec3 pos, float seed, float tm)`
   *  — a per-state CURSOR/SCROLL influence that displaces matter. Lets each
   *  environment feel different (BUILD snaps, DESIGN rearranges, GROW flows)
   *  while the base morph keeps the shared digital-matter narrative. */
  interact?: string;
};

const GRID = `
uniform float uMorph;
uniform float uTime;
uniform vec3  uColor;
varying vec2 vUv;
void main(){
  float gridA = (1.0 - smoothstep(0.0, 0.75, uMorph)) * 0.55;
  if (gridA < 0.01) discard;
  vec2 cc = abs(fract(vUv * vec2(22.0, 12.0)) - 0.5);
  float line = max(1.0 - step(0.018, cc.x), 1.0 - step(0.018, cc.y));
  float fade = 1.0 - smoothstep(0.35, 0.95, length(vUv - 0.5) * 1.15);
  float a = line * gridA * fade;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor, a);
}
`;

const GRID_VERT = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

type MorphingUniforms = {
  uTime: { value: number };
  uMorph: { value: number };
  uMouse: { value: THREE.Vector3 };
  uMouseVel: { value: number };
  uPixelRatio: { value: number };
  uFocus: { value: number };
  uScrollVel: { value: number };
  [key: string]: { value: number | THREE.Vector3 | THREE.Color };
};

type GridUniforms = {
  uMorph: { value: number };
  uTime: { value: number };
  uColor: { value: THREE.Color };
};

export type MorphingGridProps = {
  count: number;
  region?: [number, number, number];
  states: MorphState[];
  /** Smooth target morph index (0..states.length-1). */
  morph: number;
  reduced: boolean;
  clamp?: [number, number];
  /** Show the topology backdrop grid while the first state is active. */
  showGrid?: boolean;
  /** GLSL injected after palette blend, before vColor/vAlpha assignment.
   *  May modify `c` (vec3) and `baseAlpha` (float). */
  vertexFooter?: string;
};

export function MorphingGrid({
  count,
  region = [6.4, 3.6, 2.6],
  states,
  morph,
  reduced,
  clamp = [6.4, 3.6],
  showGrid = true,
  vertexFooter = "",
}: MorphingGridProps) {
  const gl = useThree((s) => s.gl);
  const pointer = usePointerWorld(clamp);
  const scrollVel = useScrollVelocity();

  // Compose the vertex shader from the state bodies once.
  const { vert, frag } = useMemo(() => {
    const n = states.length;
    const calls: string[] = [];
    const weights: string[] = [];
    for (let i = 0; i < n; i++) {
      calls.push(
        `vec3 _s${i} = _run${i}(position, aSeed, tm);`
      );
      weights.push(`float _w${i} = exp(-pow((uMorph - ${i}.0) * 1.9, 2.0));`);
    }

    const decls = states
      .map((s, i) => `vec3 _run${i}(vec3 ipos, float seed, float tm){${s.body}}`)
      .join("\n");

    const intDecls = states
      .map((s, i) =>
        s.interact
          ? `vec3 _int${i}(vec3 pos, float seed, float tm){${s.interact}}`
          : `vec3 _int${i}(vec3 pos, float seed, float tm){ return vec3(0.0); }`
      )
      .join("\n");

    const vertBody = `
uniform float uTime;
uniform float uMorph;
uniform vec3  uMouse;
uniform float uMouseVel;
uniform float uPixelRatio;
uniform float uFocus;
uniform float uScrollVel;
${colorUniformsDecl(states.length)}

attribute float aSize;
attribute float aSeed;
attribute float aDepth;
attribute vec3 aColor;

varying float vAlpha;
varying vec3 vColor;

${NOISE_LIB}
${decls}
${intDecls}

void main(){
  float tm = uTime;

${calls.join("\n")}

${weights.join("\n")}
  float _wsum = ${weights.map((_, i) => `_w${i}`).join(" + ")};

  vec3 pos = (${weights.map((_, i) => `_s${i} * _w${i}`).join(" + ")}) / _wsum;

  // Idle drift keeps the matter alive (scaled by reduced-motion focus).
  pos += vec3(
    fbm3(position*0.5 + vec3(tm*0.02, 0.0, 0.0)) - 0.5,
    fbm3(position*0.5 + vec3(0.0, tm*0.02, 0.0)) - 0.5,
    0.0
  ) * 0.05 * mix(1.0, 0.2, uFocus);

  // Mouse influence — base falloff, scaled by reduced motion via uFocus.
  vec2 toM = pos.xy - uMouse.xy;
  float dm = length(toM);
  float fb = smoothstep(1.9, 0.0, dm);
  float infl = uMouse.z * uMouseVel * uFocus;

  // Per-state CURSOR/SCROLL interaction — weighted by the morph blend so each
  // environment responds in its own way without a hard cut. Each _int body
  // returns a directional push (x,y) plus a strength scalar in z.
  vec3 _disp = (${weights.map((_, i) => `_int${i}(pos, aSeed, tm) * _w${i}`).join(" + ")}) / max(_wsum, 1e-4);
  float _istrength = clamp(_disp.z, -1.0, 1.0);
  pos.xy += _disp.xy * (0.3 + 1.2 * abs(_istrength));
  pos.xy += normalize(toM + 1e-6) * fb * 0.18 * infl * (1.0 - _istrength) * 0.6;
  pos.z += _istrength * 0.4 * infl;
  pos.xy += vec2(-toM.y, toM.x) * fb * fb * 0.05 * infl;

  // Scroll velocity: add motion while the user scrolls fast, settles after.
  pos.z += uScrollVel * 0.2;
  pos.xy += vec2(sin(position.y * 1.2 + tm * 0.7), cos(position.x * 1.2 + tm * 0.6)) * uScrollVel * 0.06;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float dist = max(-mv.z, 0.1);
  gl_PointSize = aSize * uPixelRatio * (9.0 / dist);

  float vis = smoothstep(1.2, 3.0, dist) * (1.0 - smoothstep(10.2, 13.5, dist));
  float baseAlpha = (0.3 + 0.5 * aSeed) * (0.4 + 0.6 * vis);

  // Blend the state palettes by morph weight.
  vec3 c = (${weights.map((_, i) => `uCol${i} * _w${i}`).join(" + ")}) / _wsum;
  c = mix(c, aColor, 0.22);

${vertexFooter}

  vColor = c;
  vAlpha = baseAlpha * (0.8 + 0.2 * uFocus);
  vAlpha *= mix(1.0, 0.06, uFocus);
}
`;

    const fragBody = `
varying float vAlpha;
varying vec3 vColor;
void main(){
  vec2 cc = gl_PointCoord - 0.5;
  float d = length(cc);
  float a = smoothstep(0.5, 0.0, d);
  float core = pow(a, 1.5);
  gl_FragColor = vec4(vColor * (0.6 + 0.7 * core), a * vAlpha);
}
`;

    return { vert: vertBody, frag: fragBody };
  }, [states, vertexFooter]);

  // Shared mutable uniform object. Uniform values are mutated imperatively
  // inside the animation loop; the object itself lives in a ref (created once
  // here, at first render) so the React Compiler never sees the mutation.
  // State palette uniforms are added at init — states are module constants.
  const uniformsRef = useRef<MorphingUniforms | null>(null);
  if (uniformsRef.current === null) {
    const u: MorphingUniforms = {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
      uMouseVel: { value: 0 },
      uPixelRatio: { value: 1 },
      uFocus: { value: 1 },
      uScrollVel: { value: 0 },
    };
    states.forEach((s, i) => {
      u[`uCol${i}`] = { value: new THREE.Color(s.color) };
    });
    uniformsRef.current = u;
  }

  const gridUniformsRef = useRef<GridUniforms | null>(null);
  if (gridUniformsRef.current === null) {
    gridUniformsRef.current = {
      uMorph: { value: 0 },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(states[0]?.color ?? "#173b68") },
    };
  }

  const geo = useMemo(
    () =>
      pointBuffersToGeometry(
        buildPointBuffers({
          count,
          region,
          colors: [palette.gray, palette.navy, palette.blue],
          colorWeights: [0.4, 0.4, 0.2],
          sizeRange: [0.7, 1.6],
        })
      ),
    [count, region]
  );

  const gridGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(13.4, 7.6, 1, 1);
    return g;
  }, []);

  // Dispose imperative geometries on unmount.
  useEffect(
    () => () => {
      geo.dispose();
      gridGeo.dispose();
    },
    [geo, gridGeo]
  );

  const morphRef = useRef(0);

  useFrame((state, delta) => {
    const U = uniformsRef.current!;
    const GU = gridUniformsRef.current!;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.1);

    // Ease morph toward target.
    morphRef.current = THREE.MathUtils.damp(morphRef.current, morph, 3.2, dt);
    U.uTime.value = t;
    U.uMorph.value = morphRef.current;
    U.uFocus.value = reduced ? 0.04 : 1;
    U.uPixelRatio.value = gl.getPixelRatio();
    GU.uTime.value = t;
    GU.uMorph.value = morphRef.current;

    // Camera: pull back slightly as we widen into later states.
    const cam = state.camera;
    const spread = THREE.MathUtils.clamp(morphRef.current - states.length + 2, 0, 1);
    cam.position.z = THREE.MathUtils.lerp(
      cam.position.z,
      THREE.MathUtils.lerp(9.0, 11.0, spread),
      Math.min(1, dt * 2.5)
    );

    const p = pointer.current;
    if (U.uMouseVel) U.uMouseVel.value = p.velocity;
    if (U.uScrollVel) U.uScrollVel.value = reduced ? 0 : scrollVel.get();

    if (reduced) {
      U.uMouse?.value.set(0, 0, 0);
    } else {
      U.uMouse?.value.set(p.worldX, p.worldY, 1);
    }
  });

  return (
    <>
      {showGrid && (
        <mesh geometry={gridGeo} frustumCulled={false} position={[0, 0, -0.5]}>
          <shaderMaterial
            vertexShader={GRID_VERT}
            fragmentShader={GRID}
            // eslint-disable-next-line react-hooks/refs
            uniforms={gridUniformsRef.current}
            transparent
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      <points geometry={geo} frustumCulled={false}>
        <shaderMaterial
          vertexShader={vert}
          fragmentShader={frag}
          // eslint-disable-next-line react-hooks/refs
          uniforms={uniformsRef.current}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

function colorUniformsDecl(n: number): string {
  let out = "";
  for (let i = 0; i < n; i++) out += `uniform vec3 uCol${i};\n`;
  return out;
}