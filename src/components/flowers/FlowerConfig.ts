
export interface FlowerPalette {
  primary: string;   // Petal primary (emissive, translucency tint)
  secondary: string; // Petal surface color
  stem: string;      // Stem color
  leaf: string;      // Leaf tint overlay
}

export interface FlowerBehavior {
  growthSpringConfig: { mass: number; tension: number; friction: number };
  bloomSpringConfig:  { mass: number; tension: number; friction: number };
}

export interface FlowerPlacement {
  /** World-space anchor [x, y, z]. x < 0 = left third */
  anchor: [number, number, number];
  scale: number;
}

export interface FlowerSpecies {
  id: string;
  name: string;
  petalCount: number;
  layers: number;
  baseScale: number;
}

export interface FlowerConfig {
  species:   FlowerSpecies;
  palette:   FlowerPalette;
  behavior:  FlowerBehavior;
  placement: FlowerPlacement;
}

// ─── Preset: Vespera Lily — warm pink ────────────────────────────────────────

export const LILY_PALETTE: FlowerPalette = {
  primary:   '#f87979',   // warm rose — petal emissive tint
  secondary: '#fce8e8',   // soft blush white — petal surface
  stem:      '#3d6b38',   // deep botanical green
  leaf:      '#4a7a42',   // rich leaf green
};

export const DEFAULT_FLOWER_CONFIG: FlowerConfig = {
  species: {
    id:         'vespera_lily',
    name:       'Vespera Lily',
    petalCount: 6,
    layers:     2,
    baseScale:  1.0,
  },
  palette:  LILY_PALETTE,
  behavior: {
    growthSpringConfig: { mass: 1, tension: 120, friction: 14 },
    bloomSpringConfig:  { mass: 1, tension: 80,  friction: 13 },
  },
  placement: {
    // Lower-left third anchor; flower arcs toward upper-center naturally
    anchor: [-3.2, -3.8, -1.0],
    scale:  1.0,
  },
};

// ─── Future palette presets (architecture ready) ──────────────────────────────

export const LILY_WHITE_PALETTE: FlowerPalette = {
  primary:   '#e8e0d0',
  secondary: '#f8f6f2',
  stem:      '#3d6b38',
  leaf:      '#4a7a42',
};

export const LILY_LAVENDER_PALETTE: FlowerPalette = {
  primary:   '#c8a4e8',
  secondary: '#ede0f8',
  stem:      '#3d6b38',
  leaf:      '#4a7a42',
};

export const LILY_ORANGE_PALETTE: FlowerPalette = {
  primary:   '#f87040',
  secondary: '#fde0c8',
  stem:      '#3d6b38',
  leaf:      '#4a7a42',
};
