// Draws src/assets/process/lines.svg, the faint flowing lines behind the home page's steps
// (src/components/sections/Process.astro). Run: node design/process-lines/render.mjs
//
// The lines are concentric arcs around a point beyond the bottom-left corner, all bent by the same
// wave. Neighbours therefore stay the same distance apart and never cross, and the field sweeps
// across the band the way the reference's does (fdicreative.com, "4 Easy Steps to Launch!": a
// charcoal band with fine dark lines). The drawing is this site's own; no reference artwork is used.
// Each arc is sampled at a few angles and joined with a Catmull-Rom spline written as cubic Beziers.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/assets/process/lines.svg');

/** Change these to redraw the field; run the script again and look at the section at 390 and 1440. */
const LAYOUT = {
  /** Canvas. The section covers with it (`background-size: cover`), centred. */
  width: 1920,
  height: 1200,
  /** Centre of the arcs, beyond the bottom-left corner. */
  centre: [-600, 1700],
  /** Distance between neighbouring lines, in canvas units. */
  gap: 28,
  /** Height of the shared wave, in canvas units, and how many waves fit across the arc. */
  amplitude: 220,
  waves: 1.2,
  /** Points sampled along each arc; more draws a smoother line in a larger file. */
  samples: 8,
  /** Line colour: black at this opacity darkens the band slightly, as the reference's lines do. */
  opacity: 0.16,
};

const { width: W, height: H, centre, gap, amplitude, waves, samples, opacity } = LAYOUT;
const [cx, cy] = centre;
const corners = [
  [0, 0],
  [W, 0],
  [0, H],
  [W, H],
];
const angles = corners.map(([x, y]) => Math.atan2(y - cy, x - cx));
const radii = corners.map(([x, y]) => Math.hypot(x - cx, y - cy));
const thetaMin = Math.min(...angles) - 0.08;
const thetaMax = Math.max(...angles) + 0.08;
const rMin = Math.min(...radii) - amplitude - 2 * gap;
const rMax = Math.max(...radii) + amplitude + 2 * gap;

const round = (n) => Math.round(n);
/** Relative cubic segments: shorter numbers than absolute ones. */
const toPath = (points) => {
  let d = `M${points[0].map(round)}`;
  let previous = points[0].map(round);
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    const end = p2.map(round);
    const rel = (q) => `${round(q[0]) - previous[0]},${round(q[1]) - previous[1]}`;
    d += `c${[rel(c1), rel(c2), rel(end)].join(' ')}`.replace(/,-/g, '-').replace(/ -/g, '-');
    previous = end;
  }
  return d;
};

const lines = [];
for (let r = rMin; r <= rMax; r += gap) {
  const points = [];
  for (let s = 0; s < samples; s += 1) {
    const u = s / (samples - 1);
    const theta = thetaMin + (thetaMax - thetaMin) * u;
    const radius = r + amplitude * Math.sin(2 * Math.PI * waves * u);
    points.push([cx + radius * Math.cos(theta), cy + radius * Math.sin(theta)]);
  }
  if (points.some(([x, y]) => x > -60 && x < W + 60 && y > -60 && y < H + 60)) {
    lines.push(toPath(points));
  }
}

// `non-scaling-stroke` keeps every line one CSS pixel wide however far `cover` scales the canvas.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><style>path{vector-effect:non-scaling-stroke}</style><path d="${lines.join('')}" fill="none" stroke="#000" stroke-opacity="${opacity}"/></svg>\n`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, svg);
console.log(`${lines.length} lines, ${svg.length} bytes: ${out}`);
