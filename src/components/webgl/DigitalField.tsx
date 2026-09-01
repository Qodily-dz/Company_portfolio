"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";
import { MAX_DPR, useQuality, useSceneActive, type Quality } from "@/lib/webgl-performance";
import type { WebGLComponentProps } from "./DynamicWebGL";

/* ---------------------------------------------------------------------------
 * Quality tiers
 * ------------------------------------------------------------------------- */

const TIER: Record<Quality, { count: number; lineNodes: number; dpr: [number, number] }> = {
  low: { count: 1800, lineNodes: 18, dpr: MAX_DPR.low },
  tablet: { count: 5200, lineNodes: 30, dpr: MAX_DPR.tablet },
  desktop: { count: 9000, lineNodes: 40, dpr: MAX_DPR.desktop },
};

/* ---------------------------------------------------------------------------
 * GLSL
 * ------------------------------------------------------------------------- */

const VERT = /* glsl */ `
uniform float uTime;
uniform vec3  uMouse;
uniform float uMouseVel;
uniform float uScroll;
uniform float uPixelRatio;
uniform float uFocus;

attribute float aSize;
attribute float aSeed;
attribute float aDepth;
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

void main(){
  vec3 pos = position;

  float t = uTime * 0.045;
  vec3 drift = vec3(
    fbm(pos*0.13 + vec3(t, 0.0, aSeed)),
    fbm(pos*0.13 + vec3(0.0, t*0.8, aSeed*1.7)),
    fbm(pos*0.11 + vec3(aSeed, 0.0, t*0.5))
  ) - 0.5;
  pos += drift * (0.28 + 0.7*aSeed) * uFocus;

  // Mouse: layered attraction / repulsion / turbulence, fading with velocity.
  vec2 toMouse = pos.xy - uMouse.xy;
  float d = length(toMouse);
  float radius = 1.6;
  float falloff = smoothstep(radius, 0.0, d);
  float influence = uMouse.z * uMouseVel * uFocus;
  pos.xy += normalize(toMouse + 1e-6) * (falloff * 0.32 * (0.4 + 0.3*uMouseVel) * influence);
  pos.xy += vec2(-toMouse.y, toMouse.x) * (falloff * falloff * 0.05 * influence);

  // Scroll: pull the field and shift depth, gently.
  float sc = uScroll;
  pos.z += sc * 0.7;
  pos.xy *= 1.0 - sc * 0.10;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float dist = max(-mv.z, 0.1);
  gl_PointSize = aSize * uPixelRatio * (8.5 / dist);

  float depthFade = 1.0 - smoothstep(0.0, 2.0, aDepth);
  vAlpha = (0.3 + 0.55*aSeed) * (0.5 + 0.5*depthFade);
  vColor = aColor;
}
`;

const FRAG = /* glsl */ `
varying float vAlpha;
varying vec3  vColor;

void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float alpha = smoothstep(0.5, 0.0, d);
  float core = pow(alpha, 1.6);
  gl_FragColor = vec4(vColor * (0.7 + 0.5*core), alpha * vAlpha);
}
`;

const LINE_VERT = /* glsl */ `
uniform float uTime;
uniform float uFocus;
varying float vLineAlpha;
float hash(vec3 p){ p = fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float noise(vec3 p){
  vec3 i=floor(p); vec3 f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
              mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
void main(){
  vec3 pos = position;
  float t = uTime * 0.03;
  pos.z += (noise(pos*0.18 + vec3(t,0.0,1.0)) - 0.5) * 0.5 * uFocus;
  vec4 mv = modelViewMatrix * vec4(pos,1.0);
  gl_Position = projectionMatrix * mv;
  vLineAlpha = (0.4 + 0.6 * noise(pos*0.4 + t*0.5)) * (0.5 + 0.5*uFocus);
}
`;

const LINE_FRAG = /* glsl */ `
varying float vLineAlpha;
uniform vec3 uColor;
void main(){
  gl_FragColor = vec4(uColor, vLineAlpha * 0.5);
}
`;

/* ---------------------------------------------------------------------------
 * Geometry builders
 * ------------------------------------------------------------------------- */

function buildParticleGeometry(count: number) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const depths = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  const halfW = 6.4;
  const halfH = 4.0;
  const halfD = 3.2;

  const col = new THREE.Color();
  const muted = new THREE.Color("#4f4b5e");
  const violet = new THREE.Color("#7c5cff");
  const soft = new THREE.Color("#9a8cff");

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const x = (Math.random() * 2 - 1) * halfW;
    const y = (Math.random() * 2 - 1) * halfH + 0.4;
    const z = (Math.random() * 2 - 1) * halfD;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    const seed = Math.random();
    seeds[i] = seed;
    depths[i] = (z + halfD) / (halfD * 2);
    sizes[i] = 0.7 + seed * 1.7;

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
  geo.setAttribute("aDepth", new THREE.BufferAttribute(depths, 1));
  geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  return geo;
}

function buildLineGeometry(nodes: number) {
  const spanX = 12.0;
  const spanY = 7.5;
  const halfX = spanX / 2;
  const halfY = spanY / 2;

  const h = (x: number, y: number, z: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const n = (x: number, y: number) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const gx = x - ix;
    const gy = y - iy;
    const u = gx * gx * (3 - 2 * gx);
    const v = gy * gy * (3 - 2 * gy);
    return (
      h(ix, iy, 0) * (1 - u) * (1 - v) +
      h(ix + 1, iy, 0) * u * (1 - v) +
      h(ix, iy + 1, 0) * (1 - u) * v +
      h(ix + 1, iy + 1, 0) * u * v
    );
  };

  const cells: THREE.Vector3[] = [];
  for (let j = 0; j < nodes; j++) {
    for (let i = 0; i < nodes; i++) {
      const tx = nodes > 1 ? i / (nodes - 1) : 0.5;
      const ty = nodes > 1 ? j / (nodes - 1) : 0.5;
      const x = tx * spanX - halfX;
      const y = ty * spanY - halfY + 0.4;
      const warp = n(x * 0.8, y * 0.8) - 0.5;
      const z = warp * 1.4 + (n(x * 0.3 + 5.0, y * 0.3 + 5.0) - 0.5) * 1.2;
      cells.push(new THREE.Vector3(x, y, z));
    }
  }

  const segs: number[] = [];
  const idx = (i: number, j: number) => j * nodes + i;
  const pushEdge = (a: THREE.Vector3, b: THREE.Vector3) => {
    segs.push(a.x, a.y, a.z, b.x, b.y, b.z);
  };

  for (let j = 0; j < nodes; j++) {
    for (let i = 0; i < nodes; i++) {
      const cur = cells[idx(i, j)];
      if (i + 1 < nodes) pushEdge(cur, cells[idx(i + 1, j)]);
      if (j + 1 < nodes) pushEdge(cur, cells[idx(i, j + 1)]);
      if (i + 2 < nodes && ((i * 7 + j * 13) % 5) < 2) {
        pushEdge(cur, cells[idx(i + 2, j)]);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(segs), 3));
  return geo;
}

/* ---------------------------------------------------------------------------
 * Scene
 * ------------------------------------------------------------------------- */

type Uniforms = {
  uTime: { value: number };
  uMouse: { value: THREE.Vector3 };
  uMouseVel: { value: number };
  uScroll: { value: number };
  uPixelRatio: { value: number };
  uFocus: { value: number };
};

type LineUniforms = {
  uTime: { value: number };
  uFocus: { value: number };
  uColor: { value: THREE.Color };
};

function makeUniforms(): Uniforms {
  return {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector3(0, 0, 0) },
    uMouseVel: { value: 0 },
    uScroll: { value: 0 },
    uPixelRatio: { value: 1 },
    uFocus: { value: 1 },
  };
}

function makeLineUniforms(): LineUniforms {
  return {
    uTime: { value: 0 },
    uFocus: { value: 1 },
    uColor: { value: new THREE.Color("#6f5bd0") },
  };
}

function DigitalFieldScene({ quality, reduced }: { quality: Quality; reduced: boolean }) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const rawPointer = useThree((s) => s.pointer);

  const tier = TIER[quality];

  // Uniform objects live in refs: they are created once and mutated
  // imperatively each frame inside the animation loop, which is the intended
  // R3F/Three model. The React Compiler's immutability rule is satisfied by
  // mutating refs (not useMemo values); the refs rule is disabled only where
  // we read `.current` during render to attach the uniforms to the material.
  const uniformsRef = useRef<Uniforms | null>(null);
  if (uniformsRef.current === null) uniformsRef.current = makeUniforms();
  const lineUniformsRef = useRef<LineUniforms | null>(null);
  if (lineUniformsRef.current === null) lineUniformsRef.current = makeLineUniforms();

  const particleGeo = useMemo(() => buildParticleGeometry(tier.count), [tier.count]);
  const lineGeo = useMemo(() => buildLineGeometry(tier.lineNodes), [tier.lineNodes]);

  // Imperative buffers aren't owned by the R3F reconciler — release them
  // explicitly so navigating away from the section frees the GPU memory.
  useEffect(
    () => () => {
      particleGeo.dispose();
      lineGeo.dispose();
    },
    [particleGeo, lineGeo]
  );

  const mouseWorld = useMemo(() => new THREE.Vector3(), []);
  const velRef = useRef(0);
  const prevPointer = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);

  useFrame((state, delta) => {
    const U = uniformsRef.current!;
    const LU = lineUniformsRef.current!;
    const t = state.clock.elapsedTime;
    U.uTime.value = t;
    LU.uTime.value = t;
    U.uFocus.value = reduced ? 0.12 : 1;
    LU.uFocus.value = reduced ? 0.12 : 1;
    U.uPixelRatio.value = gl.getPixelRatio();

    const y = typeof window !== "undefined" ? window.scrollY : 0;
    const max = typeof window !== "undefined" ? Math.max(window.innerHeight, 1) : 1;
    const target = Math.min(y / (max * 1.6), 1);
    scrollRef.current += (target - scrollRef.current) * Math.min(1, delta * 4);
    U.uScroll.value = scrollRef.current;

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
      mouseWorld.set(px, py, 0.5).unproject(camera);
      const dir = mouseWorld.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      const world = camera.position.clone().add(dir.multiplyScalar(dist));
      U.uMouse.value.set(
        THREE.MathUtils.clamp(world.x, -6.4, 6.4),
        THREE.MathUtils.clamp(world.y, -4.0, 4.0),
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
      <lineSegments geometry={lineGeo} frustumCulled={false}>
        <shaderMaterial
          vertexShader={LINE_VERT}
          fragmentShader={LINE_FRAG}
          // eslint-disable-next-line react-hooks/refs
          uniforms={lineUniformsRef.current}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

/* ---------------------------------------------------------------------------
 * Canvas wrapper
 * ------------------------------------------------------------------------- */

export default function DigitalField(_props: WebGLComponentProps) {
  const reducedAnim = useReducedMotion();
  const reduced = reducedAnim ?? false;

  const quality = useQuality(reduced);
  const { ref, active } = useSceneActive();

  const tier = TIER[quality];

  return (
    <Canvas
      ref={ref}
      frameloop={active ? "always" : "never"}
      dpr={tier.dpr}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 9], fov: 45, near: 0.1, far: 60 }}
      style={{ position: "absolute", inset: 0 }}
      fallback={
        <div className="h-full w-full bg-[radial-gradient(120%_120%_at_50%_40%,#0a0a0f_0%,#050505_60%)]" />
      }
    >
      <color attach="background" args={["#050505"]} />
      <DigitalFieldScene quality={quality} reduced={reduced} />
    </Canvas>
  );
}
