"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MeshStandardMaterial } from "three";

/* ---------------------------------------------------------------------------
 * NodeGraph — NODE NETWORK.
 *
 * A dynamic network of nodes and connections for BUILD / technology
 * sections. Hover a node to highlight its connected nodes and edges and
 * surface it to the caller (information shown in DOM, not 3D text).
 * Data packets travel the edges; hovering accelerates them.
 *
 * One node (`draggableId`) can be dragged with the cursor to rearrange the
 * network live — its edges, packets and neighbours follow (subtle nudge).
 *
 * Edges are one LineSegments whose positions/colors are updated every frame
 * so everything tracks the dragged node without React re-renders. Renders
 * with MeshStandardMaterial (lit) — pass ambient + point lights via the scene.
 * ------------------------------------------------------------------------- */

type Vec3 = [number, number, number];

export type GraphNode = {
  id: string;
  pos: Vec3;
};

export type GraphEdge = [number, number]; // node indices, -1 = center

export type NodeGraphProps = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  centerPos?: Vec3;
  hovered: string | null;
  selected: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  /** Packet speed multiplier when a node is hovered. */
  packetMult?: number;
  /** Number of data packets per edge (denser on large screens). */
  packetsPerEdge?: number;
  /** Node id that can be dragged (drag interaction #23). */
  draggableId?: string | null;
  reduced: boolean;
  /** Scale down geometry budgets for low-power devices. */
  lowDetail?: boolean;
  /** Color overrides (defaults to theme navy/blue). */
  colors?: {
    node?: string;
    edge?: string;
    packet?: string;
    center?: string;
    nodeFill?: string;
  };
};

const EDGE_DIM = new THREE.Color("#142038");
const EDGE_LIT = new THREE.Color("#2b5c91");
const CLAMP_X = 3.6;
const CLAMP_Y = 3.0;

export function NodeGraph({
  nodes,
  edges,
  centerPos = [0, 0, 0],
  hovered,
  selected,
  onHover,
  onSelect,
  packetMult = 3,
  packetsPerEdge = 1,
  draggableId = null,
  reduced,
  lowDetail,
  colors = {},
}: NodeGraphProps) {
  const c = {
    node: colors.node ?? "#173b68",
    edge: colors.edge ?? "#1a2130",
    packet: colors.packet ?? "#2b5c91",
    center: colors.center ?? "#173b68",
    nodeFill: colors.nodeFill ?? "#071426",
  };

  const gl = useThree((s) => s.gl);
  const nodeIds = useMemo(() => nodes.map((n) => n.id), [nodes]);

  const incident = useMemo(
    () =>
      edges.map(([a, b]) => {
        const set = new Set<string>();
        if (a >= 0) set.add(nodes[a].id);
        if (b >= 0) set.add(nodes[b].id);
        return set;
      }),
    [edges, nodes]
  );

  // Neighbour indices per node (for the drag nudge).
  const neighbours = useMemo(() => {
    const arr: Array<number[]> = nodes.map(() => []);
    edges.forEach(([a, b]) => {
      if (a >= 0 && b >= 0) {
        if (!arr[a].includes(b)) arr[a].push(b);
        if (!arr[b].includes(a)) arr[b].push(a);
      }
    });
    return arr;
  }, [edges, nodes]);

  // Data packets: staggered across edges, packetsPerEdge each.
  const packets = useMemo(() => {
    const arr: Array<{ edge: number; phase: number }> = [];
    edges.forEach((_, e) => {
      for (let k = 0; k < packetsPerEdge; k++) {
        // Deterministic per-slot phase so packets never bunch up.
        arr.push({ edge: e, phase: (Math.sin(e * 3.7 + k * 2.1) * 0.5 + 0.5) % 1 });
      }
    });
    return arr;
  }, [edges, packetsPerEdge]);

  const packetGeo = useMemo(() => {
    const positions = new Float32Array(packets.length * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [packets]);

  // Single LineSegments for all edges; positions/colors updated per frame.
  const edgeGeo = useMemo(() => {
    const positions = new Float32Array(edges.length * 6);
    const colors = new Float32Array(edges.length * 6);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [edges]);

  // Dispose imperative geometry on unmount.
  useEffect(
    () => () => {
      packetGeo.dispose();
      edgeGeo.dispose();
    },
    [packetGeo, edgeGeo]
  );

  // Live node positions — the single source of truth for edges/packets/nodes,
  // mutated every frame (not part of React state).
  const livePos = useRef<THREE.Vector3[] | null>(null);
  if (livePos.current === null) {
    livePos.current = nodes.map((n) => new THREE.Vector3(...n.pos));
  }
  const centerVector = useMemo(() => new THREE.Vector3(...centerPos), [centerPos]);

  const stateRef = useRef({ hovered, selected, packetMult, draggableId });
  useEffect(() => {
    stateRef.current = { hovered, selected, packetMult, draggableId };
  }, [hovered, selected, packetMult, draggableId]);

  const nodeGroupRef = useRef<Array<THREE.Group | null>>([]);
  const nodeMatRef = useRef<Array<MeshStandardMaterial | null>>([]);

  // Drag plumbing.
  const camRef = useRef<THREE.Camera | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const planeRef = useRef<THREE.Plane | null>(null);
  const ndcRef = useMemo(() => new THREE.Vector2(), []);
  const dragIndexRef = useRef(-1);
  const dragTargetRef = useRef(new THREE.Vector3());
  const dragStartRef = useRef(new THREE.Vector3());
  const draggedMovedRef = useRef(false);
  if (raycasterRef.current === null) raycasterRef.current = new THREE.Raycaster();
  if (planeRef.current === null) {
    planeRef.current = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  }

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (dragIndexRef.current < 0) return;
      const cam = camRef.current;
      if (!cam) return;
      const rect = gl.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      ndcRef.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycasterRef.current!.setFromCamera(ndcRef, cam);
      const hit = new THREE.Vector3();
      if (raycasterRef.current!.ray.intersectPlane(planeRef.current!, hit)) {
        dragTargetRef.current.set(
          THREE.MathUtils.clamp(hit.x, -CLAMP_X, CLAMP_X),
          THREE.MathUtils.clamp(hit.y, -CLAMP_Y, CLAMP_Y),
          0
        );
        if (!draggedMovedRef.current) {
          const s = dragStartRef.current;
          draggedMovedRef.current =
            Math.hypot(hit.x - s.x, hit.y - s.y) > 6;
        }
      }
    };
    const onUp = () => {
      dragIndexRef.current = -1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [gl, ndcRef]);

  const cameraBase = useMemo(() => new THREE.Vector3(0, 0, 9.5), []);
  const edgeTmp = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    const { hovered: hov, selected: sel, packetMult: pm } = stateRef.current;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);
    const va = new THREE.Vector3();
    const vb = new THREE.Vector3();
    camRef.current = state.camera;

    const dragging = dragIndexRef.current >= 0;

    // Camera subtly shifts toward the hovered node (paused while dragging).
    const target = cameraBase.clone();
    if (!reduced && hov && !dragging) {
      const idx = nodeIds.indexOf(hov);
      if (idx >= 0) {
        const dir = new THREE.Vector3(...nodes[idx].pos).normalize();
        target.add(dir.multiplyScalar(0.8));
      }
    }
    state.camera.position.lerp(target, 1 - Math.pow(0.0015, dt));
    state.camera.lookAt(0, 0, 0);

    // Node position + scale + emissive reaction.
    const lp = livePos.current!;
    for (let i = 0; i < nodeIds.length; i++) {
      const g = nodeGroupRef.current[i];
      const m = nodeMatRef.current[i];
      if (!g || !m) continue;

      let tx = nodes[i].pos[0];
      let ty = nodes[i].pos[1];
      if (dragging && i === dragIndexRef.current) {
        tx = dragTargetRef.current.x;
        ty = dragTargetRef.current.y;
      } else if (dragging) {
        // Neighbours of the dragged node yield aside a little.
        const d = dragIndexRef.current;
        const dx = dragTargetRef.current.x - lp[d].x;
        const dy = dragTargetRef.current.y - lp[d].y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.15 && dist < 3.0 && neighbours[d].includes(i)) {
          const push = (1 - dist / 3.0) * 0.6;
          tx += (dx / dist) * push;
          ty += (dy / dist) * push;
        }
      }
      const f = 1 - Math.pow(0.0015, dt);
      g.position.x = THREE.MathUtils.lerp(g.position.x, tx, f);
      g.position.y = THREE.MathUtils.lerp(g.position.y, ty, f);
      g.position.z = THREE.MathUtils.lerp(g.position.z, nodes[i].pos[2], f);
      lp[i].copy(g.position);

      const isHov = hov === nodeIds[i];
      const isSel = sel === nodeIds[i];
      const targetScale = isHov ? 1.3 : isSel ? 1.16 : 1;
      const sf = 1 - Math.pow(0.001, dt);
      g.scale.x = THREE.MathUtils.lerp(g.scale.x, targetScale, sf);
      g.scale.y = g.scale.x;
      g.scale.z = g.scale.x;
      const glow = isHov ? 1 : isSel ? 0.6 : 0;
      m.emissiveIntensity = THREE.MathUtils.lerp(
        m.emissiveIntensity,
        glow * (reduced ? 0.35 : 0.6),
        sf
      );
    }

    // Edges follow live node positions; brightness reacts to the focal node.
    const posAttr = edgeGeo.getAttribute("position") as THREE.BufferAttribute;
    const colAttr = edgeGeo.getAttribute("color") as THREE.BufferAttribute;
    const cpos = posAttr.array as Float32Array;
    const ccol = colAttr.array as Float32Array;
    for (let e = 0; e < edges.length; e++) {
      const a = edges[e][0];
      const b = edges[e][1];
      va.copy(a < 0 ? centerVector : lp[a]);
      vb.copy(b < 0 ? centerVector : lp[b]);
      const i6 = e * 6;
      cpos[i6] = va.x;
      cpos[i6 + 1] = va.y;
      cpos[i6 + 2] = va.z;
      cpos[i6 + 3] = vb.x;
      cpos[i6 + 4] = vb.y;
      cpos[i6 + 5] = vb.z;

      const bright =
        hov && incident[e].has(hov)
          ? 1
          : sel && incident[e].has(sel)
            ? 0.72
            : 0.3;
      const pulse = reduced ? 0 : 0.1 + Math.sin(t * 1.6 + e) * 0.07;
      edgeTmp.copy(EDGE_DIM).lerp(EDGE_LIT, Math.min(bright + pulse, 1));
      ccol[i6] = edgeTmp.r;
      ccol[i6 + 1] = edgeTmp.g;
      ccol[i6 + 2] = edgeTmp.b;
      ccol[i6 + 3] = edgeTmp.r;
      ccol[i6 + 4] = edgeTmp.g;
      ccol[i6 + 5] = edgeTmp.b;
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // Moving data packets (follow live positions too).
    const pkPosAttr = packetGeo.getAttribute("position") as THREE.BufferAttribute;
    for (let p = 0; p < packets.length; p++) {
      const pk = packets[p];
      const e = pk.edge;
      const a = edges[e][0];
      const b = edges[e][1];
      va.copy(a < 0 ? centerVector : lp[a]);
      vb.copy(b < 0 ? centerVector : lp[b]);
      const mult = hov && incident[e].has(hov) ? pm * 3 : pm;
      const prog = reduced ? pk.phase : (t * 0.28 * mult + pk.phase) % 1;
      pkPosAttr.setXYZ(
        p,
        va.x + (vb.x - va.x) * prog,
        va.y + (vb.y - va.y) * prog,
        va.z + (vb.z - va.z) * prog
      );
    }
    pkPosAttr.needsUpdate = true;
  });

  const startDrag = (i: number) => {
    if (reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const g = nodeGroupRef.current[i];
    if (!g) return;
    dragIndexRef.current = i;
    dragTargetRef.current.copy(g.position);
    dragStartRef.current.copy(g.position);
    draggedMovedRef.current = false;
  };

  return (
    <>
      {/* Edges (one LineSegments, per-vertex colors follow the nodes). */}
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Data packets */}
      <points geometry={packetGeo}>
        <pointsMaterial
          size={0.09}
          color={c.packet}
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Center node */}
      <mesh position={centerPos}>
        <sphereGeometry args={lowDetail ? [0.34, 16, 16] : [0.34, 24, 24]} />
        <meshStandardMaterial
          color={c.center}
          emissive={c.center}
          emissiveIntensity={0.35}
          roughness={0.35}
          metalness={0.25}
        />
      </mesh>

      {/* Network nodes */}
      {nodes.map((node, i) => {
        const isDraggable = draggableId === node.id;
        return (
          <group
            key={node.id}
            ref={(g) => {
              nodeGroupRef.current[i] = g;
            }}
            position={node.pos}
            onPointerDown={(e) => {
              e.stopPropagation();
              if (isDraggable) startDrag(i);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHover(node.id);
            }}
            onPointerOut={() => onHover(null)}
            onClick={(e) => {
              e.stopPropagation();
              if (draggedMovedRef.current) {
                draggedMovedRef.current = false;
                return;
              }
              onSelect(selected === node.id ? null : node.id);
            }}
          >
            <mesh>
              <sphereGeometry args={lowDetail ? [0.2, 12, 12] : [0.2, 20, 20]} />
              <meshStandardMaterial
                ref={(m) => {
                  nodeMatRef.current[i] = m;
                }}
                color={c.nodeFill}
                emissive={c.node}
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