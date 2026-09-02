"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { NOISE_LIB } from "./shaders";
import {
  buildLatticeBuffers,
  latticeToGeometry,
  latticeEdgeGeometry,
} from "./geometry";
import { usePointerWorld } from "./pointer";
import { useScrollVelocity } from "@/lib/motion/useScrollVelocity";

/* ---------------------------------------------------------------------------
 * ParticleCloud — THE DIGITAL FIELD.
 *
 * A STRUCTURED lattice of points (not a random cloud) extends into depth:
 * information + space + technology. The field is ALIVE even at rest — slow
 * noise drift plus a perpetual TECH PULSE: two unseen emitters orbit through
 * the depth firing rhythmic rings across the lattice, and a gentle throb
 * runs through point size and brightness. On top of that the cursor locally
 * deforms it (fast cursor = stronger waves) and clicks ring a small ripple;
 * scroll drifts the camera through the field and scroll velocity speeds the
 * idle motion until it settles again.
 *
 * On capable devices the field is framed by faint wireframe TECH SHAPES (a
 * large orbital ring + two small fixtures) that rotate and pulse slowly.
 *
 * As the hero scrolls away the points ORGANIZE into a network — IDEA ->
 * STRUCTURE — matching the language of the BUILD section. Edges live on the
 * anchors so the form stabilizes as it organizes; the shapes dissolve.
 *
 * One instance = one primary 3D concept. Do not stack effects.
 * ------------------------------------------------------------------------- */

const DEFAULT_REGION: [number, number, number] = [7.0, 4.2, 6.6];
const DEFAULT_CENTER: [number, number, number] = [0, 0, -6.0];
const DEFAULT_CLAMP: [number, number] = [7.0, 4.2];

const MAX_RIPPLES = 4;
const RIPPLE_LIFE = 4;
/** Perpetual tech-pulse emitters (never disabled on capable devices). */
const MAX_PULSES = 2;
const PULSE_PERIODS = [4.6, 6.3];

const VERT = /* glsl */ `
uniform float uTime;
uniform vec3  uMouse;
uniform float uMouseVel;
uniform float uNet;
uniform float uScrollVel;
uniform float uPixelRatio;
uniform float uFocus;
uniform float uWarp;
uniform float uRippleStrength;
uniform float uPulseStrength;
uniform vec4  uRipples[${MAX_RIPPLES}];
uniform vec4  uPulses[${MAX_PULSES}];

attribute float aSize;
attribute float aSeed;
attribute vec3  aColor;
attribute vec3  aAnchor;
attribute float aHighlight;

varying float vAlpha;
varying vec3  vColor;

${NOISE_LIB}

// A traveling ring wave from an emitter (center, start-time).
// Ripples and the perpetual tech pulses share this.
float ringGen(vec2 pos, vec2 center, float t0, float rate, float decay){
  float age = uTime - t0;
  if (age < 0.0) return 0.0;
  vec2 toR = pos - center;
  float dr = length(toR) + 1e-5;
  return sin(dr * rate - age * 9.0) * exp(-dr * decay) * exp(-age * 1.7);
}

void main(){
  vec3 pos = position;
  float org = uNet;

  // Structured idle drift — motion scales with scroll velocity, then the
  // field settles back to a gentle baseline when scrolling stops.
  float ft = uTime * (0.35 + 1.35 * uScrollVel);
  vec3 drift = vec3(
    fbm3(aAnchor * 0.16 + vec3(ft * 0.05, 0.0, aSeed * 3.0)) - 0.5,
    fbm3(aAnchor * 0.16 + vec3(0.0, ft * 0.045, aSeed * 5.0)) - 0.5,
    fbm3(aAnchor * 0.14 + vec3(aSeed, 0.0, ft * 0.03)) - 0.5
  ) * (0.5 + 0.6 * aSeed) * uFocus * (1.0 - org * 0.85);
  pos += drift * 0.9;

  // Always-on breathing: a soft z-wave and a throb through size/brightness
  // so the field reads as alive even when the cursor is still.
  pos.z += sin(uTime * 0.7 + aAnchor.x * 0.5) * 0.06 * uFocus;
  float throb = 0.5 + 0.5 * sin(uTime * 1.15 + aSeed * 6.28318 + aAnchor.z * 0.28);

  // IDEA -> STRUCTURE: points settle onto their lattice anchors as the hero
  // scrolls away; the network of edges fades in alongside.
  pos = mix(pos, aAnchor, smoothstep(0.0, 1.0, org) * 0.92);

  // Cursor: localized deformation. Fast cursor -> stronger waves, slow
  // cursor -> subtle movement.
  vec2 toM = pos.xy - uMouse.xy;
  float dm = length(toM);
  float lens = 1.0 - smoothstep(0.0, 2.2, dm);
  float infl = uMouseVel * uFocus * uWarp;
  pos.xy += normalize(toM + 1e-6) * (lens * lens * infl * 0.34);
  pos.xy += vec2(-toM.y, toM.x) * (lens * lens * infl * 0.05);
  pos.z += lens * lens * infl * 0.5 * (1.0 - dm * 0.4);

  // Perpetual TECH PULSE — rhythmic rings firing on a repeating cycle.
  for (int i = 0; i < ${MAX_PULSES}; i++) {
    vec4 r = uPulses[i];
    if (r.w < 0.5) continue;
    float wave = ringGen(pos.xy, r.xy, r.z, 5.5, 0.6);
    vec2 toR = pos.xy - r.xy;
    float dr = length(toR) + 1e-5;
    pos.xy += (toR / dr) * wave * (0.3 * uPulseStrength * uFocus);
    pos.z += wave * (0.14 * uPulseStrength * uFocus);
  }

  // Click ripple — a small pulse rings outward and dies.
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec4 r = uRipples[i];
    if (r.w < 0.5) continue;
    float wave = ringGen(pos.xy, r.xy, r.z, 7.0, 0.85);
    vec2 toR = pos.xy - r.xy;
    float dr = length(toR) + 1e-5;
    pos.xy += (toR / dr) * wave * (0.5 * uRippleStrength * uFocus);
    pos.z += wave * (0.22 * uRippleStrength * uFocus);
  }

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  // Field extends into depth rather than sitting on a screen wall: fade the
  // near plane (in front of the type) and the far wall.
  float nearFade = 1.0 - smoothstep(-0.8, 1.4, pos.z);
  float farFade  = smoothstep(-15.0, -11.0, pos.z);
  float depthFade = nearFade * farFade;

  vec3 c = aColor;
  c = mix(c, vec3(0.14, 0.31, 0.54), org * 0.28);
  c += vec3(0.06, 0.08, 0.11) * aHighlight;
  c += vec3(0.03, 0.05, 0.09) * throb;

  float alpha = (0.34 + 0.5 * aSeed) * depthFade * (0.78 + 0.22 * org);
  alpha *= 0.72 + 0.28 * throb;

  float dist = max(-mv.z, 0.1);
  gl_PointSize = clamp(aSize * uPixelRatio * (9.5 / dist), 0.4, 3.2);
  gl_PointSize *= 0.86 + 0.28 * throb;

  vColor = c;
  vAlpha = alpha;
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
  gl_FragColor = vec4(vColor * (0.7 + 0.5 * core), alpha * vAlpha);
}
`;

type Uniforms = {
  uTime: { value: number };
  uMouse: { value: THREE.Vector3 };
  uMouseVel: { value: number };
  uNet: { value: number };
  uScrollVel: { value: number };
  uPixelRatio: { value: number };
  uFocus: { value: number };
  uWarp: { value: number };
  uRippleStrength: { value: number };
  uPulseStrength: { value: number };
  uRipples: { value: Array<THREE.Vector4> };
  uPulses: { value: Array<THREE.Vector4> };
};

type Ripple = { x: number; y: number; t0: number };

/**
 * Dispose imperative BufferGeometry (not R3F-reconciled, so we release it
 * explicitly when the visual unmounts).
 */
function useDisposableGeometry(geo: THREE.BufferGeometry | null) {
  useEffect(
    () => () => {
      geo?.dispose();
    },
    [geo]
  );
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * FieldGeometries — TECH SHAPES framing the field.
 * Faint additive wireframe fixtures (a large orbital ring + two small
 * shapes) that rotate and breathe slowly. They dodge pointer events so the
 * field's click ripples keep working. Desktop-only (skipped when reduced or
 * simplified) to keep low-end devices clean.
 */
function FieldGeometries() {
  const ringGeo = useMemo(() => new THREE.TorusGeometry(2.9, 0.006, 3, 160), []);
  const icosaGeo = useMemo(() => new THREE.IcosahedronGeometry(0.42, 1), []);
  const octaGeo = useMemo(() => new THREE.OctahedronGeometry(0.3, 0), []);

  const ringMesh = useRef<THREE.Mesh>(null);
  const icosaMesh = useRef<THREE.Mesh>(null);
  const octaMesh = useRef<THREE.Mesh>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial | null>(null);

  useEffect(
    () => () => {
      ringGeo.dispose();
      icosaGeo.dispose();
      octaGeo.dispose();
      ringMat.current?.dispose();
    },
    [ringGeo, icosaGeo, octaGeo]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringMesh.current) {
      ringMesh.current.rotation.z = t * 0.08;
      ringMesh.current.rotation.x = Math.PI * 0.42 + Math.sin(t * 0.21) * 0.12;
      const s = 1 + Math.sin(t * 1.1) * 0.02;
      ringMesh.current.scale.set(s, s, 1);
    }
    if (icosaMesh.current) {
      icosaMesh.current.rotation.x = t * 0.23;
      icosaMesh.current.rotation.y = t * 0.17;
      icosaMesh.current.scale.setScalar(1 + Math.sin(t * 1.4 + 1.0) * 0.09);
    }
    if (octaMesh.current) {
      octaMesh.current.rotation.x = t * 0.18 + 0.6;
      octaMesh.current.rotation.y = t * 0.26;
      octaMesh.current.scale.setScalar(1 + Math.sin(t * 1.6 + 2.1) * 0.12);
    }
  });

  return (
    <group>
      <mesh
        ref={ringMesh}
        geometry={ringGeo}
        position={[0, 0, -3.6]}
        raycast={() => null}
      >
        <meshBasicMaterial
          ref={ringMat}
          color="#2b5c91"
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh
        ref={icosaMesh}
        geometry={icosaGeo}
        position={[-3.6, 1.1, -4.4]}
        raycast={() => null}
      >
        <meshBasicMaterial
          color="#173b68"
          wireframe
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh
        ref={octaMesh}
        geometry={octaGeo}
        position={[3.8, 0.9, -6.4]}
        raycast={() => null}
      >
        <meshBasicMaterial
          color="#173b68"
          wireframe
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export function ParticleCloud({
  dims,
  region = DEFAULT_REGION,
  center = DEFAULT_CENTER,
  reduced,
  simplified = false,
  clamp = DEFAULT_CLAMP,
}: {
  /** Lattice dimensions [cols, rows, layers]. */
  dims: [number, number, number];
  region?: [number, number, number];
  center?: [number, number, number];
  reduced: boolean;
  /** Low tier: reduced interaction and warp so mobile stays clean. */
  simplified?: boolean;
  clamp?: [number, number];
}) {
  const { gl } = useThree((s) => ({ gl: s.gl }));
  const pointer = usePointerWorld(clamp);
  const scrollVel = useScrollVelocity();

  const lattice = useMemo(
    () =>
      buildLatticeBuffers({
        cols: dims[0],
        rows: dims[1],
        layers: dims[2],
        region,
        center,
      }),
    [dims, region, center]
  );

  const geo = useMemo(() => latticeToGeometry(lattice), [lattice]);
  const edgeGeo = useMemo(() => latticeEdgeGeometry(lattice), [lattice]);

  useDisposableGeometry(geo);
  useDisposableGeometry(edgeGeo);

  const uniformsRef = useRef<Uniforms | null>(null);
  if (uniformsRef.current === null) {
    uniformsRef.current = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
      uMouseVel: { value: 0 },
      uNet: { value: 0 },
      uScrollVel: { value: 0 },
      uPixelRatio: { value: 1 },
      uFocus: { value: 1 },
      uWarp: { value: 1 },
      uRippleStrength: { value: 0.7 },
      uPulseStrength: { value: 0.9 },
      uRipples: {
        value: Array.from(
          { length: MAX_RIPPLES },
          () => new THREE.Vector4(0, 0, 0, 0)
        ),
      },
      uPulses: {
        value: Array.from(
          { length: MAX_PULSES },
          () => new THREE.Vector4(0, 0, 0, 0)
        ),
      },
    };
  }

  const edgeMatRef = useRef<THREE.LineBasicMaterial | null>(null);
  const ripplesRef = useRef<Array<Ripple>>([]);
  const scrollRef = useRef(0);
  const netRef = useRef(0);
  const timeRef = useRef(0);
  const camRef = useRef<THREE.Camera | null>(null);
  const tmpA = useRef(new THREE.Vector3());
  const tmpB = useRef(new THREE.Vector3());

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (reduced) return;
    const cam = camRef.current;
    if (!cam) return;

    // Map the pointer to the cursor plane (z=0) so ripples land where the
    // user clicks, even though the field extends into depth.
    const v = tmpA.current
      .set(e.pointer.x, e.pointer.y, 0.5)
      .unproject(cam);
    const dir = v.sub(cam.position);
    if (Math.abs(dir.z) < 1e-6) return;
    const dist = -cam.position.z / dir.z;
    const hit = tmpB.current.copy(cam.position).add(dir.multiplyScalar(dist));

    const next = [...ripplesRef.current, { x: hit.x, y: hit.y, t0: timeRef.current }];
    while (next.length > MAX_RIPPLES) next.shift();
    ripplesRef.current = next;
  };

  useFrame((state, delta) => {
    const U = uniformsRef.current!;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.1);

    timeRef.current = t;
    camRef.current = state.camera;

    U.uTime.value = t;
    U.uPixelRatio.value = gl.getPixelRatio();
    U.uFocus.value = reduced ? 0.12 : 1;
    U.uWarp.value = reduced ? 0 : simplified ? 0.55 : 1;
    U.uRippleStrength.value = reduced ? 0 : simplified ? 0.45 : 0.7;
    U.uPulseStrength.value = reduced ? 0 : simplified ? 0.5 : 1;

    const p = pointer.current;
    if (U.uMouseVel) U.uMouseVel.value = p.velocity;
    if (U.uScrollVel) U.uScrollVel.value = reduced ? 0 : scrollVel ? scrollVel.get() : 0;
    if (reduced) {
      U.uMouse?.value.set(0, 0, 0);
    } else {
      U.uMouse?.value.set(p.worldX, p.worldY, 1);
    }

    // Hero scroll progress (0 at top -> 1 after one viewport). Camera glides
    // through the field, then eases back as the network organizes.
    const y = typeof window !== "undefined" ? window.scrollY : 0;
    const vh = typeof window !== "undefined" ? Math.max(window.innerHeight, 1) : 1;
    const targetScroll = Math.min(y / vh, 1);
    scrollRef.current +=
      (targetScroll - scrollRef.current) * Math.min(1, dt * 3);
    const sc = scrollRef.current;

    const targetNet = smoothstep(0.18, 0.55, sc);
    netRef.current += (targetNet - netRef.current) * Math.min(1, dt * 2.4);
    const net = netRef.current;
    U.uNet.value = net;

    const travel = smoothstep(0.0, 0.3, sc);
    const cam = state.camera;
    cam.position.z = 9.4 - 2.8 * travel + net * 1.9;
    cam.lookAt(0, 0, -2.0);

    // Ripples: prune dead ones, upload up to MAX_RIPPLES.
    const alive = ripplesRef.current.filter((r) => t - r.t0 < RIPPLE_LIFE);
    ripplesRef.current = alive;
    const arr = U.uRipples.value;
    for (let i = 0; i < MAX_RIPPLES; i++) {
      const r = alive[i];
      if (r) arr[i].set(r.x, r.y, r.t0, 1);
      else arr[i].set(0, 0, 0, 0);
    }

    // Perpetual TECH PULSE: two emitters orbit slowly through the field and
    // refire on independent repeat cycles, so rings are always propagating.
    const pulsing = !reduced && U.uPulseStrength.value > 0;
    const pv = U.uPulses.value;
    for (let i = 0; i < MAX_PULSES; i++) {
      if (!pulsing) {
        pv[i].set(0, 0, 0, 0);
        continue;
      }
      const period = PULSE_PERIODS[i];
      const ang = t * (0.2 + i * 0.07) + i * Math.PI;
      const cx = Math.cos(ang) * 2.6;
      const cy = Math.sin(ang) * 1.4;
      const t0 = t - ((t % period) + period) % period;
      pv[i].set(cx, cy, t0, 1);
    }

    // Network edges fade in as the field organizes.
    const m = edgeMatRef.current;
    if (m) {
      const target = net * (reduced ? 0.35 : 0.72);
      m.opacity = THREE.MathUtils.damp(m.opacity, target, 4, dt);
    }
  });

  return (
    <>
      <lineSegments geometry={edgeGeo} frustumCulled={false}>
        <lineBasicMaterial
          ref={edgeMatRef}
          color="#173b68"
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <points geometry={geo} frustumCulled={false} onPointerDown={onPointerDown}>
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
      {!reduced && !simplified && <FieldGeometries />}
    </>
  );
}