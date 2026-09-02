"use client";

import type { Quality } from "@/lib/webgl-performance";
import { ENGINEERING_NODES } from "@/lib/engineering";
import { SceneCanvas, NodeGraph, type GraphEdge } from "../../webgl/library";

/* ---------------------------------------------------------------------------
 * EngineeringField — TECHNOLOGY visual.
 *
 * A node network around a single center: hover a discipline to highlight its
 * connections and shift the camera; click to open details in the section's
 * DOM panel. Rendered by the shared NodeGraph; lights + edge wiring live here.
 * ------------------------------------------------------------------------- */

const NODES = ENGINEERING_NODES.map((n) => ({ id: n.id, pos: n.pos }));

/* edges: [nodeIndexA, nodeIndexB], -1 = center */
const EDGES: GraphEdge[] = [
  ...ENGINEERING_NODES.map((_, i) => [-1, i] as GraphEdge),
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

const FALLBACK = (
  <div className="h-full w-full bg-[radial-gradient(120%_110%_at_50%_45%,#0b1018_0%,#030405_72%)]" />
);

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
  return (
    <SceneCanvas fallback={FALLBACK}>
      {({ quality, reduced }) => (
        <>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 6]} intensity={1.1} color="#2b5c91" />
          <pointLight position={[-5, -3, 4]} intensity={0.6} color="#173b68" />
          <NodeGraph
            nodes={NODES}
            edges={EDGES}
            hovered={hovered}
            selected={selected}
            onHover={onHover}
            onSelect={onSelect}
            packetMult={packetMult}
            packetsPerEdge={packetCountFor(quality)}
            draggableId="api"
            reduced={reduced}
            lowDetail={quality === "low"}
          />
        </>
      )}
    </SceneCanvas>
  );
}

function packetCountFor(quality: Quality): number {
  return quality === "low" ? 1 : quality === "tablet" ? 2 : 3;
}