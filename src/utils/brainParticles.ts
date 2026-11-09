export type BrainStructure = 'frontal' | 'parieto_temporal' | 'cerebellum_stem';

export interface BrainParticle {
  x: number;
  y: number;
  z: number;
  hue: number;
  size: number;
  shade: number;
  structure?: BrainStructure;
}

export const LOGIN_BURST_DURATION = 1250;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => 1 - (1 - clamp(value)) ** 3;

/**
 * 3-color structural motion brain particle system:
 * 1. Frontal & Executive Cortex (Electric Iris / Violet, hue ~265°)
 * 2. Parieto-Temporal-Occipital Mantle (Luminous Mint / Cyan, hue ~172°)
 * 3. Cerebellum & Brainstem Axis (Radiant Saffron / Gold, hue ~40°)
 * Decorative cortical surface; never represents student scores or medical data.
 */
export function createBrainParticles(count = 5200): BrainParticle[] {
  const points: BrainParticle[] = [];
  let seed = 13;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const perHemisphere = Math.max(100, Math.min(7000, Math.ceil(count / 2)));

  for (const side of [-1, 1]) {
    for (let i = 0; i < perHemisphere; i++) {
      const ny = 1 - (2 * (i + 0.5)) / perHemisphere;
      const ring = Math.sqrt(1 - ny * ny);
      const angle = i * 2.399963;
      const nx = Math.abs(Math.cos(angle) * ring);
      const nz = Math.sin(angle) * ring;
      const a = Math.sin(12 * ny + 2.4 * Math.sin(4.8 * nz) + 1.5 * Math.sin(5 * nx));
      const b = Math.sin(10 * nz + 2.5 * Math.sin(4 * ny) + 1.1 * Math.cos(5 * nx));
      const sulcusA = Math.exp(-((a / 0.3) ** 2));
      const sulcusB = Math.exp(-((b / 0.26) ** 2));
      const cortex = 1 - 0.105 * sulcusA - 0.075 * sulcusB;

      const px = side * (0.032 + 0.88 * nx ** 0.84 * cortex * (1 + 0.17 * Math.exp(-(((ny + 0.42) / 0.23) ** 2))));
      const py = ny * 0.79 * cortex + 0.08 + 0.055 * (1 - ny * ny) - 0.06 * Math.max(-nz, 0);
      const pz = nz * 1.08 * cortex * (1 + 0.085 * Math.max(nz, 0));

      // Structural delineation:
      // 1. Central sulcus divides frontal lobe (anterior) from parietal/occipital (posterior)
      const isFrontal = nz > 0.02 + 0.14 * ny;
      // 2. Medial basal junction connecting cerebrum to brainstem
      const isDeepCore = nx < 0.12 && py < -0.15 && Math.abs(pz) < 0.25;

      let hue: number;
      let structure: BrainStructure;
      if (isDeepCore) {
        hue = 38 + random() * 8; // Radiant Saffron Gold core
        structure = 'cerebellum_stem';
      } else if (isFrontal) {
        hue = 262 + random() * 16; // Electric Iris Violet
        structure = 'frontal';
      } else {
        hue = 165 + random() * 16; // Luminous Mint / Cyan
        structure = 'parieto_temporal';
      }

      points.push({
        x: px,
        y: py,
        z: pz,
        hue,
        size: 0.48 + random() * 0.55,
        shade: (1 - 0.72 * Math.max(sulcusA, sulcusB * 0.83)) * (nx < 0.085 ? 0.45 : 1),
        structure,
      });
    }
  }

  // Structure 3: Infratentorial Cerebellar Folia (Laminar horizontal ridges)
  const cerebellumCount = Math.ceil(count * 0.08);
  const stemCount = Math.ceil(count * 0.04);
  for (let i = 0; i < cerebellumCount; i++) {
    const ny = 1 - (2 * (i + 0.5)) / cerebellumCount;
    const r = Math.sqrt(1 - ny * ny);
    const a = i * 2.399963;
    const ridge = 1 - 0.045 * (1 + Math.sin(ny * 52));
    points.push({
      x: Math.cos(a) * r * 0.46 * ridge,
      y: -0.61 + ny * 0.29,
      z: -0.65 + Math.sin(a) * r * 0.4 * ridge,
      hue: 38 + random() * 8, // Radiant Saffron Gold
      size: 0.45 + random() * 0.35,
      shade: 0.65 + 0.3 * Math.abs(Math.cos(ny * 26)),
      structure: 'cerebellum_stem',
    });
  }

  // Structure 3: Descending Brainstem Column
  for (let i = 0; i < stemCount; i++) {
    const t = i / Math.max(1, stemCount - 1);
    const a = i * 2.399963;
    const width = 0.12 * (1 - t) + 0.055;
    points.push({
      x: Math.cos(a) * width,
      y: -0.51 - t * 0.69,
      z: -0.2 - t * 0.2 + Math.sin(a) * width,
      hue: 40 + random() * 8, // Radiant Saffron Gold
      size: 0.48 + random() * 0.3,
      shade: 0.85,
      structure: 'cerebellum_stem',
    });
  }

  return points;
}

export function projectBrainParticle(
  point: BrainParticle,
  width: number,
  height: number,
  yaw = 0.85,
  pitch = -0.23
) {
  const x = point.x * Math.cos(yaw) + point.z * Math.sin(yaw);
  const depth = point.z * Math.cos(yaw) - point.x * Math.sin(yaw);
  const perspective = 3.4 / (3.4 - depth);
  const scale = Math.min(width * 0.33, height * 0.34);
  return {
    x: width * 0.52 + x * scale * perspective,
    y: height * 0.45 - (point.y * Math.cos(pitch) - depth * Math.sin(pitch)) * scale * perspective,
    depth,
    size: point.size * perspective * (width > 250 ? 1 : 0.65),
  };
}

export function burstParticle(
  point: BrainParticle,
  index: number,
  progress: number,
  width: number,
  height: number,
  yaw = 0.85,
  pitch = -0.23
) {
  const t = clamp(progress);
  const burst = clamp((t - 0.2) / 0.65);
  // Cinematic camera push-in zoom accelerating toward the core
  const zoom = 1 + 9 * (burst ** 2.2);
  const p = projectBrainParticle(point, width, height, yaw, pitch);
  const cx = width * 0.52;
  const cy = height * 0.45;
  const dx = p.x - cx;
  const dy = p.y - cy;
  const dist = Math.hypot(dx, dy) || 1;
  const dirX = dx / dist;
  const dirY = dy / dist;

  // Radial blast shockwave projecting outward from center
  const ray = index * 2.399963;
  const blastForce = (42 + (index % 71) * 3.5) * (burst ** 1.7);
  const scatterX = (dirX * 0.72 + Math.cos(ray) * 0.28) * blastForce;
  const scatterY = (dirY * 0.72 + Math.sin(ray) * 0.28) * blastForce;

  const currentX = cx + (dx + scatterX) * zoom;
  const currentY = cy + (dy + scatterY) * zoom;
  const opacity = t >= 0.75 ? Math.max(0, 1 - ease((t - 0.75) / 0.25)) : 1;

  return {
    x: currentX,
    y: currentY,
    depth: p.depth,
    burst,
    zoom,
    opacity,
  };
}

export function createBrainFrameLoop(options: {
  request: (callback: (time: number) => void) => number;
  cancel: (id: number) => void;
  paint: (time: number) => void;
  canAnimate: () => boolean;
}) {
  let handle: number | null = null;
  let stopped = false;
  const run = (time: number) => {
    handle = null;
    if (stopped) return;
    options.paint(time);
    if (!stopped && options.canAnimate()) {
      handle = options.request(run);
    }
  };
  return {
    invalidate() {
      if (stopped || handle !== null) return;
      handle = options.request(run);
    },
    stop() {
      stopped = true;
      if (handle !== null) {
        options.cancel(handle);
        handle = null;
      }
    },
  };
}
