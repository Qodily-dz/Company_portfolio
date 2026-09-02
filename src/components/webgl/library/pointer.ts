/* ---------------------------------------------------------------------------
 * Pointer tracking — shared hook for converting screen pointer to world
 * coordinates and tracking velocity, used by all interactive visuals.
 * ------------------------------------------------------------------------- */

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type PointerState = {
  /** World-space X position, clamped to the region. */
  worldX: number;
  /** World-space Y position, clamped to the region. */
  worldY: number;
  /** Current pointer velocity 0..1 (0 = still, 1 = fast). */
  velocity: number;
  /** True when a pointer is over the canvas. */
  active: boolean;
};

/**
 * Track the mouse pointer in world space, clamped to a region.
 * Returns a ref that is updated every frame (no React re-renders).
 * Values are read imperatively inside the visual's own useFrame.
 */
export function usePointerWorld(clamp: [number, number] = [6.4, 4.0]) {
  const camera = useThree((s) => s.camera);
  const rawPointer = useThree((s) => s.pointer);

  const state = useRef<PointerState>({ worldX: 0, worldY: 0, velocity: 0, active: false });
  const prevPointer = useRef({ x: 0, y: 0 });
  const velocityRef = useRef(0);
  const world = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const px = rawPointer.x;
    const py = rawPointer.y;

    // Unproject to the plane of the camera's target (z world center).
    world.current.set(px, py, 0.5).unproject(camera);
    const dir = world.current.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    world.current.copy(camera.position).add(dir.multiplyScalar(dist));

    state.current.worldX = THREE.MathUtils.clamp(world.current.x, -clamp[0], clamp[0]);
    state.current.worldY = THREE.MathUtils.clamp(world.current.y, -clamp[1], clamp[1]);

    // Velocity from pointer delta.
    const dx = px - prevPointer.current.x;
    const dy = py - prevPointer.current.y;
    const inst = Math.min(Math.hypot(dx, dy) * 8, 1);
    velocityRef.current += (inst - velocityRef.current) * Math.min(1, delta * 6);
    prevPointer.current = { x: px, y: py };

    state.current.velocity = velocityRef.current;
    state.current.active = true;
  });

  return state;
}