"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";
import { MAX_DPR, useQuality, useSceneActive } from "@/lib/webgl-performance";
import { ENGINEERING_NODES } from "@/lib/engineering";

/* ---------------------------------------------------------------------------
 * 3D technology constellation — a network of engineering disciplines around a
 * single center. Procedural geometry only (spheres, lines, points): no logos,
 * no model files. Nodes hover (grow + camera shift + edges react), click opens
 * technical details via the section's DOM panel.
 * ------------------------------------------------------------------------- */

type Vec3 = [number, number, number];

function rand(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const NODE_IDS = ENGINEERING_NODES.map((n) => n.id);
const NODE_VECS: Vec3[] = ENGINEERING_NODES.map((n) => n.pos);

/* edges: [nodeIndexA, nodeIndexB], -1 = center */
const EDGES: Array<[number, number]> = [
  ...ENGINEERING_NODES.map((_, i) => [-1, i] as [number, number]),
  [0, 2],
  [0, 6],
  [2, 1],
  [2, 4],
  [2, 7],
  [1, 3],
  [3, 4],
  [3, 8],
  [7, 6],
  [8, 1],
  [5, 1],
  [5, 4],
];

const EDGE_COUNT = EDGES.length;

/* packets per edge — fewer on small screens for performance */
const PACKETS_PER_EDGE = EDGE_COUNT > 12 ? 3 : 1;

const INCIDENT = EDGES.map(([a, b]) =>
  new Set(
    [a, b]
      .filter((x) => x >= 0)
      .map((x) => NODE_IDS[x])
  )
);

function vertex(idx: number): THREE.Vector3 {
  if (idx < 0) return new THREE.Vector3(0, 0, 0);
  return new THREE.Vector3(...NODE_VECS[idx]);
}

function edgeBrightness(
  hovered: string | null,
  selected: string | null,
  incident: Set<string>
): number {
  if (hovered && incident.has(hovered)) return 1;
  if (selected && incident.has(selected)) return 0.7;
  return 0.28;
}

/* build a packet per edge slot: { edge, phase } */
const PACKETS: Array<{ edge: number; phase: number }> = [];
EDGES.forEach((_, e) => {
  for (let k = 0; k < PACKETS_PER_EDGE; k++) {
    PACKETS.push({ edge: e, phase: rand(e * 9 + k, 5) });
  }
});
const TOTAL_PACKETS = PACKETS.length;

type SceneProps = {
  hovered: string | null;
  selected: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  packetMult: number;
  reduced: boolean;
  lowDetail: boolean;
};

function ConstellationScene({
  hovered,
  selected,
  onHover,
  onSelect,
  packetMult,
  reduced,
  lowDetail,
}: SceneProps) {
  const stateRef = useRef({ hovered, selected, packetMult });
  useEffect(() => {
    stateRef.current = { hovered, selected, packetMult };
  }, [hovered, selected, packetMult]);

  const nodeGroupRef = useRef<Array<THREE.Group | null>>([]);
  const nodeMatRef = useRef<Array<THREE.MeshStandardMaterial | null>>([]);
  const lineMatRef = useRef<Array<THREE.LineBasicMaterial | null>>([]);

  const packetGeo = useMemo(() => {
    const positions = new Float32Array(TOTAL_PACKETS * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  // Imperative buffer isn't owned by the R3F reconciler — release it on
  // unmount so navigating away frees the GPU memory.
  useEffect(
    () => () => {
      packetGeo.dispose();
    },
    [packetGeo]
  );

  /* running packet start index per edge */
  const packetStart = useMemo(() => {
    const arr: number[] = [];
    let c = 0;
    EDGES.forEach(() => {
      arr.push(c);
      c += PACKETS_PER_EDGE;
    });
    return arr;
  }, []);

  const cameraBase = useMemo(() => new THREE.Vector3(0, 0, 9.5), []);

  useFrame((state, delta) => {
    const { hovered: hov, selected: sel, packetMult: pm } = stateRef.current;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    /* camera subtly shifts toward the hovered node */
    const target = cameraBase.clone();
    if (!reduced && hov) {
      const idx = NODE_IDS.indexOf(hov);
      if (idx >= 0) {
        const dir = new THREE.Vector3(...NODE_VECS[idx]).normalize();
        target.add(dir.multiplyScalar(0.8));
      }
    }
    state.camera.position.lerp(target, 1 - Math.pow(0.0015, dt));
    state.camera.lookAt(0, 0, 0);

    /* node scale + material reaction */
    for (let i = 0; i < NODE_IDS.length; i++) {
      const g = nodeGroupRef.current[i];
      const m = nodeMatRef.current[i];
      if (!g || !m) continue;
      const isHov = hov === NODE_IDS[i];
      const isSel = sel === NODE_IDS[i];
      const targetScale = isHov ? 1.3 : isSel ? 1.16 : 1;
      const f = 1 - Math.pow(0.001, dt);
      g.scale.x = THREE.MathUtils.lerp(g.scale.x, targetScale, f);
      g.scale.y = g.scale.x;
      g.scale.z = g.scale.x;
      const glow = isHov ? 1 : isSel ? 0.6 : 0;
      m.emissiveIntensity = THREE.MathUtils.lerp(
        m.emissiveIntensity,
        glow * (reduced ? 0.35 : 0.65),
        f
      );
    }

    /* edges react to the focused node */
    for (let e = 0; e < EDGE_COUNT; e++) {
      const lm = lineMatRef.current[e];
      if (!lm) continue;
      const b = edgeBrightness(hov, sel, INCIDENT[e]);
      const pulse = reduced ? 0 : 0.14 + Math.sin(t * 1.6 + e) * 0.1;
      lm.opacity = b + pulse;
      lm.color.setHSL(0.705, 0.55, 0.3 + b * 0.28);
    }

    /* moving data packets */
    const posAttr = packetGeo.getAttribute("position") as THREE.BufferAttribute;
    for (let e = 0; e < EDGE_COUNT; e++) {
      const va = vertex(EDGES[e][0]);
      const vb = vertex(EDGES[e][1]);
      const start = packetStart[e];
      const mult = hov && INCIDENT[e].has(hov) ? pm * 3 : pm;
      for (let k = 0; k < PACKETS_PER_EDGE; k++) {
        const p = PACKETS[start + k];
        const prog = reduced
          ? p.phase
          : (t * 0.28 * mult + p.phase) % 1;
        const x = va.x + (vb.x - va.x) * prog;
        const y = va.y + (vb.y - va.y) * prog;
        const z = va.z + (vb.z - va.z) * prog;
        posAttr.setXYZ(start + k, x, y, z);
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 6]} intensity={1.1} color="#9d84ff" />
      <pointLight position={[-5, -3, 4]} intensity={0.6} color="#4fd8b8" />

      {EDGES.map(([a, b], e) => {
        const va = vertex(a);
        const vb = vertex(b);
        const arr = new Float32Array([va.x, va.y, va.z, vb.x, vb.y, vb.z]);
        return (
          <line key={e}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[arr, 3]} />
            </bufferGeometry>
            <lineBasicMaterial
              ref={(m) => {
                if (m) lineMatRef.current[e] = m;
              }}
              transparent
              opacity={0.28}
              color="#3f3f4d"
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </line>
        );
      })}

      {/* data packets */}
      <points geometry={packetGeo}>
        <pointsMaterial
          size={0.09}
          color="#7c5cff"
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* center node */}
      <group>
        <mesh>
          <sphereGeometry args={lowDetail ? [0.34, 16, 16] : [0.34, 24, 24]} />
          <meshStandardMaterial
            color="#7c5cff"
            emissive="#7c5cff"
            emissiveIntensity={0.35}
            roughness={0.35}
            metalness={0.25}
          />
        </mesh>
      </group>

      {/* discipline nodes */}
      {ENGINEERING_NODES.map((node, i) => {
        const [px, py, pz] = node.pos;
        return (
          <group
            key={node.id}
            ref={(g) => {
              nodeGroupRef.current[i] = g;
            }}
            position={[px, py, pz]}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHover(node.id);
            }}
            onPointerOut={() => onHover(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(selected === node.id ? null : node.id);
            }}
          >
            <mesh>
              <sphereGeometry args={lowDetail ? [0.2, 12, 12] : [0.2, 20, 20]} />
              <meshStandardMaterial
                ref={(m) => {
                  if (m) nodeMatRef.current[i] = m;
                }}
                color="#14141c"
                emissive="#7c5cff"
                emissiveIntensity={0}
                roughness={0.4}
                metalness={0.2}
              />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

export function EngineeringField({
  hovered,
  selected,
  onHover,
  onSelect,
  packetMult,
}: {
  hovered: string | null;
  selected: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  packetMult: number;
}) {
  const reducedAnim = useReducedMotion();
  const reduced = reducedAnim ?? false;
  const quality = useQuality(reduced);
  const { ref, active } = useSceneActive();

  return (
    <Canvas
      ref={ref}
      frameloop={active ? "always" : "never"}
      dpr={quality === "low" ? MAX_DPR.low : MAX_DPR.tablet}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 9.5], fov: 45, near: 0.1, far: 40 }}
      style={{ position: "absolute", inset: 0 }}
      fallback={
        <div className="h-full w-full bg-[radial-gradient(120%_110%_at_50%_45%,#0a0a0f_0%,#050505_72%)]" />
      }
    >
      <ConstellationScene
        hovered={hovered}
        selected={selected}
        onHover={onHover}
        onSelect={onSelect}
        packetMult={packetMult}
        reduced={reduced}
        lowDetail={quality === "low"}
      />
    </Canvas>
  );
}
