/* ---------------------------------------------------------------------------
 * Procedural visual library — shared building blocks for all WebGL visuals.
 *
 * Follow the art direction rules:
 *  - ONE primary 3D concept per major section, plus small supporting details.
 *  - Never stack multiple visuals; never use random/meaningless 3D objects.
 *  - Every visual is procedural, quality-tiered, and reduced-motion aware.
 * ------------------------------------------------------------------------- */

// Foundations
export { SceneCanvas } from "./SceneCanvas";
export { palette, dpr } from "./theme";
export { HASH31, NOISE3, FBM3, NOISE2D, NOISE_LIB } from "./shaders";
export {
  buildPointBuffers,
  pointBuffersToGeometry,
  buildNodePositions,
} from "./geometry";
export { usePointerWorld, type PointerState } from "./pointer";

// Visual systems
export {
  ParticleCloud,
} from "./ParticleCloud";
export {
  MorphingGrid,
  type MorphingGridProps,
  type MorphState,
} from "./MorphingGrid";
export {
  NodeGraph,
  type NodeGraphProps,
  type GraphNode,
  type GraphEdge,
} from "./NodeGraph";