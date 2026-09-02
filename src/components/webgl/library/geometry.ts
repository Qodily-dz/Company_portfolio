/* ---------------------------------------------------------------------------
 * Buffer geometry builders — shared geometry helpers for all visuals.
 * Each returns a BufferGeometry ready for shader material.
 * ------------------------------------------------------------------------- */

import * as THREE from "three";

type PointConfig = {
  /** Number of particles. */
  count: number;
  /** Region half-extents [halfW, halfH, halfD]. */
  region: [number, number, number];
  /** Palette keys used for color distribution (sRGB values 0..1). */
  colors: ReadonlyArray<readonly [number, number, number]>;
  /** Distribution of each color band (should sum to ~1). */
  colorWeights?: ReadonlyArray<number>;
  /** Size range [min, max] for point sizes. */
  sizeRange?: [number, number];
};

type PointBuffers = {
  positions: Float32Array;
  sizes: Float32Array;
  seeds: Float32Array;
  depths: Float32Array;
  colors: Float32Array;
};

/**
 * Build a random point cloud with positions, sizes, seeds, depth, and
 * multi-band colors inside a rectangular region.
 */
export function buildPointBuffers({
  count,
  region,
  colors,
  colorWeights,
  sizeRange = [0.7, 2.0],
}: PointConfig): PointBuffers {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const depths = new Float32Array(count);
  const colorArr = new Float32Array(count * 3);

  const [halfW, halfH, halfD] = region;

  // Build weighted cumulative distribution for color selection
  const weights = colorWeights ?? colors.map(() => 1 / colors.length);
  const cumulative: number[] = [];
  let sum = 0;
  for (const w of weights) {
    sum += w;
    cumulative.push(sum);
  }
  const total = cumulative[cumulative.length - 1] || 1;

  const colA = new THREE.Color();
  const colB = new THREE.Color();

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
    depths[i] = (z + halfD) / (halfD * 2); // 0..1
    sizes[i] = sizeRange[0] + seed * (sizeRange[1] - sizeRange[0]);

    // Select color band via weighted random
    const r = Math.random() * total;
    let band = 0;
    for (let b = 0; b < cumulative.length; b++) {
      if (r <= cumulative[b]) { band = b; break; }
    }

    // Blend between adjacent colors for smooth transitions.
    // setRGB applies sRGB -> linear conversion (ColorManagement), matching
    // `new THREE.Color("#hex")` used elsewhere in the project.
    const nextBand = Math.min(band + 1, colors.length - 1);
    colA.setRGB(colors[band][0], colors[band][1], colors[band][2]);
    colB.setRGB(colors[nextBand][0], colors[nextBand][1], colors[nextBand][2]);
    colA.lerp(colB, seed * 0.4); // subtle variation within band
    colorArr[i3] = colA.r;
    colorArr[i3 + 1] = colA.g;
    colorArr[i3 + 2] = colA.b;
  }

  return { positions, sizes, seeds, depths, colors: colorArr };
}

/**
 * Create a BufferGeometry from point buffers (positions, sizes, seeds,
 * depths, colors).
 */
export function pointBuffersToGeometry(buffers: PointBuffers): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(buffers.positions, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(buffers.sizes, 1));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(buffers.seeds, 1));
  geo.setAttribute("aDepth", new THREE.BufferAttribute(buffers.depths, 1));
  geo.setAttribute("aColor", new THREE.BufferAttribute(buffers.colors, 3));
  return geo;
}

/**
 * Generate random positions for sphere-like nodes in a volume.
 */
export function buildNodePositions(
  count: number,
  radius: number
): Array<[number, number, number]> {
  const positions: Array<[number, number, number]> = [];
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * Math.cbrt(Math.random());
    positions.push([
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    ]);
  }
  return positions;
}

/* ---------------------------------------------------------------------------
 * Structured lattice — THE DIGITAL FIELD.
 *
 * A volume of points arranged on a 3D grid (not a random cloud) so the scene
 * reads as "information + space + technology". A fraction of cells are culled
 * for air; each kept point gets a small jitter around its lattice anchor.
 * Neighbour pairs are captured so the field can *organize into a network*.
 * ------------------------------------------------------------------------- */

export type LatticeBuffers = {
  positions: Float32Array;
  sizes: Float32Array;
  seeds: Float32Array;
  depths: Float32Array;
  colors: Float32Array;
  /** Un-jittered lattice position — where a point settles when organized. */
  anchors: Float32Array;
  /** 1 for the small set of brighter "accent" points. */
  highlights: Float32Array;
  /** Pairs of kept indices making up the network (right/up/back neighbours). */
  edgePairs: Array<[number, number]>;
};

export type LatticeConfig = {
  /** Lattice dimensions [cols, rows, layers]. */
  cols: number;
  rows: number;
  layers: number;
  /** Region half-extents [halfW, halfH, halfD]. */
  region?: [number, number, number];
  /** Region centre, e.g. pushed into depth. */
  center?: [number, number, number];
  /** Fraction of lattice cells retained (0..1). */
  keep?: number;
  /** Jitter as a fraction of lattice spacing (0..1). */
  jitter?: number;
};

/** Palette bands: ~white, gray, subtle navy, brighter blue highlights. */
export const FIELD_BANDS: ReadonlyArray<{
  readonly c: readonly [number, number, number];
  readonly w: number;
}> = [
  { c: [0.93, 0.95, 0.98], w: 0.5 }, // near-white
  { c: [0.55, 0.58, 0.65], w: 0.3 }, // gray
  { c: [0.09, 0.23, 0.41], w: 0.15 }, // deep blue (subtle)
  { c: [0.17, 0.42, 0.69], w: 0.05 }, // brighter blue highlight
];

export function buildLatticeBuffers({
  cols,
  rows,
  layers,
  region: [halfW, halfH, halfD] = [7.0, 4.2, 6.6],
  center: [cx, cy, cz] = [0, 0, -6.0],
  keep = 0.6,
  jitter = 0.16,
}: LatticeConfig): LatticeBuffers {
  const positions: number[] = [];
  const sizes: number[] = [];
  const seeds: number[] = [];
  const depths: number[] = [];
  const colors: number[] = [];
  const anchors: number[] = [];
  const highlights: number[] = [];
  const edgePairs: Array<[number, number]> = [];

  const stepX = cols > 1 ? (halfW * 2) / (cols - 1) : 1;
  const stepY = rows > 1 ? (halfH * 2) / (rows - 1) : 1;
  const stepZ = layers > 1 ? (halfD * 2) / (layers - 1) : 1;

  const cellIndex = new Int32Array(cols * rows * layers).fill(-1);

  const weights: number[] = [];
  let sum = 0;
  for (const b of FIELD_BANDS) {
    sum += b.w;
    weights.push(sum);
  }

  const colA = new THREE.Color();
  const colB = new THREE.Color();

  let index = 0;
  for (let l = 0; l < layers; l++) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = (l * rows + r) * cols + c;
        if (Math.random() > keep) continue;

        const ax = cx - halfW + c * stepX;
        const ay = cy - halfH + r * stepY;
        const az = cz - halfD + l * stepZ;
        const px = ax + (Math.random() * 2 - 1) * jitter * stepX;
        const py = ay + (Math.random() * 2 - 1) * jitter * stepY;
        const pz = az + (Math.random() * 2 - 1) * jitter * stepZ;

        const seed = Math.random();
        const rnd = Math.random() * sum;
        let band = 0;
        for (let b = 0; b < weights.length; b++) {
          if (rnd <= weights[b]) {
            band = b;
            break;
          }
        }

        const nextBand = Math.min(band + 1, FIELD_BANDS.length - 1);
        colA.setRGB(FIELD_BANDS[band].c[0], FIELD_BANDS[band].c[1], FIELD_BANDS[band].c[2]);
        colB.setRGB(
          FIELD_BANDS[nextBand].c[0],
          FIELD_BANDS[nextBand].c[1],
          FIELD_BANDS[nextBand].c[2]
        );
        colA.lerp(colB, seed * 0.4);

        const isHighlight = band === 3;
        positions.push(px, py, pz);
        anchors.push(ax, ay, az);
        seeds.push(seed);
        sizes.push(isHighlight ? 1.5 + seed * 0.9 : 0.5 + seed * 1.2);
        colors.push(colA.r, colA.g, colA.b);
        depths.push((pz - (cz - halfD)) / (halfD * 2));
        highlights.push(isHighlight ? 1 : 0);
        cellIndex[cell] = index++;
      }
    }
  }

  // Network edges between kept neighbours (each direction once).
  for (let l = 0; l < layers; l++) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = (l * rows + r) * cols + c;
        const a = cellIndex[cell];
        if (a < 0) continue;
        if (c + 1 < cols) {
          const b = cellIndex[cell + 1];
          if (b >= 0) edgePairs.push([a, b]);
        }
        if (r + 1 < rows) {
          const b = cellIndex[cell + cols];
          if (b >= 0) edgePairs.push([a, b]);
        }
        if (l + 1 < layers) {
          const b = cellIndex[cell + cols * rows];
          if (b >= 0) edgePairs.push([a, b]);
        }
      }
    }
  }

  return {
    positions: new Float32Array(positions),
    sizes: new Float32Array(sizes),
    seeds: new Float32Array(seeds),
    depths: new Float32Array(depths),
    colors: new Float32Array(colors),
    anchors: new Float32Array(anchors),
    highlights: new Float32Array(highlights),
    edgePairs,
  };
}

/**
 * Convert structured lattice buffers to a BufferGeometry (positions,
 * aSize, aSeed, aDepth, aColor, aAnchor, aHighlight).
 */
export function latticeToGeometry(buffers: LatticeBuffers): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(buffers.positions, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(buffers.sizes, 1));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(buffers.seeds, 1));
  geo.setAttribute("aDepth", new THREE.BufferAttribute(buffers.depths, 1));
  geo.setAttribute("aColor", new THREE.BufferAttribute(buffers.colors, 3));
  geo.setAttribute("aAnchor", new THREE.BufferAttribute(buffers.anchors, 3));
  geo.setAttribute("aHighlight", new THREE.BufferAttribute(buffers.highlights, 1));
  return geo;
}

/**
 * Build the network LineSegments geometry from the lattice anchors —
 * edges sit on the settled lattice so the form stabilizes as it organizes.
 */
export function latticeEdgeGeometry(buffers: LatticeBuffers): THREE.BufferGeometry {
  const { anchors, edgePairs } = buffers;
  const positions = new Float32Array(edgePairs.length * 6);
  for (let e = 0; e < edgePairs.length; e++) {
    const [a, b] = edgePairs[e];
    const i6 = e * 6;
    const ia = a * 3;
    const ib = b * 3;
    positions[i6] = anchors[ia];
    positions[i6 + 1] = anchors[ia + 1];
    positions[i6 + 2] = anchors[ia + 2];
    positions[i6 + 3] = anchors[ib];
    positions[i6 + 4] = anchors[ib + 1];
    positions[i6 + 5] = anchors[ib + 2];
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geo;
}
