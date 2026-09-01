"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";
import { MAX_DPR, useQuality, useSceneActive, type Quality } from "@/lib/webgl-performance";
import type { PillarId } from "@/lib/services";

/* ---------------------------------------------------------------------------
 * Quality tiers
 * ------------------------------------------------------------------------- */

const TIER: Record<Quality, { count: number; dpr: [number, number] }> = {
  low: { count: 1800, dpr: MAX_DPR.low },
  tablet: { count: 5200, dpr: MAX_DPR.tablet },
  desktop: { count: 9000, dpr: MAX_DPR.desktop },
};

/* ---------------------------------------------------------------------------
 * GLSL
 * ------------------------------------------------------------------------- */

const VERT = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform vec3  uMouse;
uniform float uMouseVel;
uniform float uPixelRatio;
uniform float uFocus;
uniform vec3  uColBuild;
uniform vec3  uColDesign;
uniform vec3  uColGrow;

attribute float aSize;
attribute float aSeed;
attribute float aStage;
attribute vec3  aColor;

varying float vAlpha;
varying vec3  vColor;

float hash(vec3 p){
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 p){
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i+vec3(0.0,0.0,0.0)), hash(i+vec3(1.0,0.0,0.0)), f.x),
        mix(hash(i+vec3(0.0,1.0,0.0)), hash(i+vec3(1.0,1.0,0.0)), f.x), f.y),
    mix(mix(hash(i+vec3(0.0,0.0,1.0)), hash(i+vec3(1.0,0.0,1.0)), f.x),
        mix(hash(i+vec3(0.0,1.0,1.0)), hash(i+vec3(1.0,1.0,1.0)), f.x), f.y),
    f.z);
}
float fbm(vec3 p){
  return noise(p) * 0.55 + noise(p*2.02) * 0.25 + noise(p*4.04) * 0.13 + noise(p*8.08) * 0.07;
}

/* BUILD — software architecture: matter snaps into a lattice network,
   nodes snap hard, a strand of connectors drifts between them, and a
   "data packet" pulse moves through the topology. */
vec3 buildPos(vec3 p, float seed){
  float res = 4.5;
  vec3 g = floor(p * res + 0.5) / res;
  float snap = seed < 0.52 ? 0.93 : 0.34;
  vec3 q = mix(p, g, snap);
  float strand = step(0.5, fract(seed * 13.7));
  q += (g - p) * strand * 0.5;
  return q;
}

/* DESIGN — fluid: matter flows with layered noise, smooth like liquid. */
vec3 designPos(vec3 p, float seed, float tm){
  vec3 dir = vec3(
    fbm(p*0.42 + vec3(tm*0.04, seed*0.3, 0.0)),
    fbm(p*0.42 + vec3(seed*0.5, tm*0.05, 0.0)),
    fbm(p*0.36 + vec3(0.0, 0.0, tm*0.02 + seed))
  ) - 0.5;
  return p + dir * (0.7 + 1.0 * seed);
}

/* GROW — directional data flow: matter streams along X through a funnel,
   tightening in the middle then widening, packets travelling the funnel. */
vec3 growPos(float stage, float seed, float tm){
  float span = 6.5;
  float flow = fract(tm * 0.14 + seed * 2.2);
  float fx = (flow * 2.0 - 1.0) * span;
  float s = abs(fx) / span;
  float width = 0.28 + 1.7 * s * s + 0.5 * s;
  float y = (hash(vec3(seed, flow, 3.1)) - 0.5) * width;
  float z = (hash(vec3(seed, flow, 7.7)) - 0.5) * width * 0.8;
  return vec3(fx, y, z);
}

void main(){
  float tm = uTime;
  float seed = aSeed;

  vec3 pB = buildPos(position, seed);
  vec3 pD = designPos(position, seed, tm);
  vec3 pG = growPos(aStage, seed, tm);

  float wB = smoothstep(0.65, 0.0, uMorph);
  float wD = exp(-pow((uMorph - 1.0) * 1.5, 2.0));
  float wG = smoothstep(1.35, 2.0, uMorph);
  float wSum = max(wB + wD + wG, 1e-4);

  vec3 pos = (pB * wB + pD * wD + pG * wG) / wSum;

  // Idle drift keeps the matter alive (scaled by reduced-motion focus).
  pos += vec3(
    fbm(position*0.5 + vec3(tm*0.02, 0.0, 0.0)) - 0.5,
    fbm(position*0.5 + vec3(0.0, tm*0.02, 0.0)) - 0.5,
    0.0
  ) * 0.05 * mix(1.0, 0.2, uFocus);

  // Mouse swirl — influence fades to ~0 under reduced motion via uFocus.
  vec2 toM = pos.xy - uMouse.xy;
  float dm = length(toM);
  float fb = smoothstep(1.9, 0.0, dm);
  float infl = uMouse.z * uMouseVel * (1.0 - uFocus * 0.0);
  pos.xy += normalize(toM + 1e-6) * fb * 0.22 * infl * 0.4;
  pos.xy += vec2(-toM.y, toM.x) * fb * fb * 0.06 * infl;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float dist = max(-mv.z, 0.1);
  gl_PointSize = aSize * uPixelRatio * (9.0 / dist);

  // Fade points in near the camera and back out toward the far plane, so the
  // matter reads as a soft volume without hard clipping.
  float vis = smoothstep(1.2, 3.0, dist) * (1.0 - smoothstep(10.2, 13.5, dist));
  float baseAlpha = (0.3 + 0.5 * aSeed) * (0.4 + 0.6 * vis);

  // Blend the three state palettes by morph weight.
  vec3 c = (uColBuild * wB + uColDesign * wD + uColGrow * wG) / wSum;
  c = mix(c, aColor, 0.22);

  // BUILD: travelling data packet pulse.
  float packet = fract(tm * 0.28 + dot(floor(position * 4.0 * (0.5 + aSeed)), vec3(1.0, 0.5, 0.7)) * 0.7);
  float pulse = smoothstep(0.16, 0.0, packet) * wB;

  vColor = c * (1.0 + pulse * 1.5);
  vAlpha = baseAlpha * (0.8 + 0.6 * pulse);
  vAlpha *= mix(1.0, 0.06, uFocus);
}
`;

const FRAG = /* glsl */ `
varying float vAlpha;
varying vec3  vColor;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d);
  float core = pow(a, 1.5);
  gl_FragColor = vec4(vColor * (0.6 + 0.7 * core), a * vAlpha);
}
`;

/* BUILD backdrop: a subtle topology grid that fades out as we morph away. */
const GRID_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const GRID_FRAG = /* glsl */ `
uniform float uMorph;
uniform float uTime;
uniform vec3  uColor;
varying vec2 vUv;
void main(){
  float gridA = (1.0 - smoothstep(0.0, 0.75, uMorph)) * 0.55;
  if (gridA < 0.01) discard;
  vec2 c = abs(fract(vUv * vec2(22.0, 12.0)) - 0.5);
  float line = max(1.0 - step(0.018, c.x), 1.0 - step(0.018, c.y));
  float fade = 1.0 - smoothstep(0.35, 0.95, length(vUv - 0.5) * 1.15);
  float a = line * gridA * fade;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor, a);
}
`;

/* ---------------------------------------------------------------------------
 * Geometry builders
 * ------------------------------------------------------------------------- */

function buildParticleGeometry(count: number) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const stages = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  const halfW = 6.4;
  const halfH = 3.6;
  const halfD = 2.6;

  const col = new THREE.Color();
  const muted = new THREE.Color("#4f4b5e");
  const violet = new THREE.Color("#7c5cff");
  const soft = new THREE.Color("#9a8cff");

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const x = (Math.random() * 2 - 1) * halfW;
    const y = (Math.random() * 2 - 1) * halfH;
    const z = (Math.random() * 2 - 1) * halfD;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    const seed = Math.random();
    seeds[i] = seed;
    stages[i] = Math.random();
    sizes[i] = 0.7 + seed * 1.6;

    const pick = Math.random();
    if (pick < 0.4) col.copy(muted);
    else if (pick < 0.8) col.copy(muted).lerp(violet, seed);
    else col.lerpColors(violet, soft, seed);
    colors[i3] = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geo.setAttribute("aStage", new THREE.BufferAttribute(stages, 1));
  geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  return geo;
}

function buildGridGeometry() {
  const geo = new THREE.PlaneGeometry(13.4, 7.6, 1, 1);
  return geo;
}

/* ---------------------------------------------------------------------------
 * Scene — one persistent particle system that morphs between pillar states
 * ------------------------------------------------------------------------- */

type PillarUniforms = {
  uTime: { value: number };
  uMorph: { value: number };
  uMouse: { value: THREE.Vector3 };
  uMouseVel: { value: number };
  uPixelRatio: { value: number };
  uFocus: { value: number };
  uColBuild: { value: THREE.Color };
  uColDesign: { value: THREE.Color };
  uColGrow: { value: THREE.Color };
};

type GridUniforms = {
  uMorph: { value: number };
  uTime: { value: number };
  uColor: { value: THREE.Color };
};

function makeUniforms(): PillarUniforms {
  return {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uMouse: { value: new THREE.Vector3(0, 0, 0) },
    uMouseVel: { value: 0 },
    uPixelRatio: { value: 1 },
    uFocus: { value: 1 },
    uColBuild: { value: new THREE.Color("#7c5cff") },
    uColDesign: { value: new THREE.Color("#8f7cff") },
    uColGrow: { value: new THREE.Color("#4fd8b8") },
  };
}

function makeGridUniforms(): GridUniforms {
  return {
    uMorph: { value: 0 },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("#6f5bd0") },
  };
}

function PillarFieldScene({
  quality,
  reduced,
  targetMorph,
}: {
  quality: Quality;
  reduced: boolean;
  targetMorph: number;
}) {
  const gl = useThree((s) => s.gl);
  const rawPointer = useThree((s) => s.pointer);

  const tier = TIER[quality];

  const uniformsRef = useRef<PillarUniforms | null>(null);
  if (uniformsRef.current === null) uniformsRef.current = makeUniforms();
  const gridUniformsRef = useRef<GridUniforms | null>(null);
  if (gridUniformsRef.current === null) gridUniformsRef.current = makeGridUniforms();

  const particleGeo = useMemo(() => buildParticleGeometry(tier.count), [tier.count]);
  const gridGeo = useMemo(() => buildGridGeometry(), []);

  // Imperative buffers aren't owned by the R3F reconciler — release them
  // explicitly so navigating away from the section frees the GPU memory.
  useEffect(
    () => () => {
      particleGeo.dispose();
      gridGeo.dispose();
    },
    [particleGeo, gridGeo]
  );

  const mouseWorld = useMemo(() => new THREE.Vector3(), []);
  const morphRef = useRef(0);
  const velRef = useRef(0);
  const prevPointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const U = uniformsRef.current!;
    const GU = gridUniformsRef.current!;
    const cam = state.camera;
    const t = state.clock.elapsedTime;

    // Smoothly ease the morph toward the active pillar — never a hard jump,
    // so switching feels like the same matter transforming.
    morphRef.current = THREE.MathUtils.damp(
      morphRef.current,
      targetMorph,
      3.2,
      delta
    );

    U.uTime.value = t;
    U.uMorph.value = morphRef.current;
    U.uFocus.value = reduced ? 0.04 : 1;
    U.uPixelRatio.value = gl.getPixelRatio();
    GU.uTime.value = t;
    GU.uMorph.value = morphRef.current;

    // Camera: pull back slightly as we widen into the grow funnel.
    cam.position.z = THREE.MathUtils.lerp(
      cam.position.z,
      THREE.MathUtils.lerp(9.0, 11.0, THREE.MathUtils.clamp(morphRef.current - 1.0, 0, 1)),
      Math.min(1, delta * 2.5)
    );

    const px = rawPointer.x;
    const py = rawPointer.y;
    const dx = px - prevPointer.current.x;
    const dy = py - prevPointer.current.y;
    const inst = Math.min(Math.hypot(dx, dy) * 8, 1);
    velRef.current += (inst - velRef.current) * Math.min(1, delta * 6);
    prevPointer.current = { x: px, y: py };
    U.uMouseVel.value = velRef.current;

    if (reduced) {
      U.uMouse.value.set(0, 0, 0);
    } else {
      mouseWorld.set(px, py, 0.5).unproject(cam);
      const dir = mouseWorld.sub(cam.position).normalize();
      const dist = -cam.position.z / dir.z;
      const world = cam.position.clone().add(dir.multiplyScalar(dist));
      U.uMouse.value.set(
        THREE.MathUtils.clamp(world.x, -6.4, 6.4),
        THREE.MathUtils.clamp(world.y, -3.6, 3.6),
        1
      );
    }
  });

  return (
    <group>
      <points geometry={particleGeo} frustumCulled={false}>
        <shaderMaterial
          vertexShader={VERT}
          fragmentShader={FRAG}
          // eslint-disable-next-line react-hooks/refs
          uniforms={uniformsRef.current}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh geometry={gridGeo} frustumCulled={false} position={[0, 0, -0.5]}>
        <shaderMaterial
          vertexShader={GRID_VERT}
          fragmentShader={GRID_FRAG}
          // eslint-disable-next-line react-hooks/refs
          uniforms={gridUniformsRef.current}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------------------
 * Canvas wrapper — mounts ONCE and persists; only the morph target changes
 * ------------------------------------------------------------------------- */

export default function PillarField({ active }: { active: PillarId }) {
  const reducedAnim = useReducedMotion();
  const reduced = reducedAnim ?? false;

  const quality = useQuality(reduced);
  const { ref, active: sceneActive } = useSceneActive();

  const tier = TIER[quality];

  const target = useMemo(
    () => (active === "build" ? 0 : active === "design" ? 1 : 2),
    [active]
  );

  return (
    <Canvas
      ref={ref}
      frameloop={sceneActive ? "always" : "never"}
      dpr={tier.dpr}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 9], fov: 45, near: 0.1, far: 60 }}
      style={{ position: "absolute", inset: 0 }}
      fallback={
        <div className="h-full w-full bg-[radial-gradient(120%_120%_at_50%_40%,#0a0a0f_0%,#050505_60%)]" />
      }
    >
      <color attach="background" args={["#050505"]} />
      <PillarFieldScene quality={quality} reduced={reduced} targetMorph={target} />
    </Canvas>
  );
}
