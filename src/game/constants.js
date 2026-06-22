export const COLS = 20;
export const ROWS = 12;

export const CELL = {
  WALL: 1,
  DOT: 2,
  EMPTY: 0,
  POWER: 3,
};

// 0 = empty, 1 = wall, 2 = dot, 3 = power pellet
export const MAZE_TEMPLATE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1],
  [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
  [1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const PLAYER_START = { x: 10, y: 6 };

export const GHOST_START = [
  { x: 9, y: 7, dx: 1, dy: 0 },
  { x: 10, y: 7, dx: -1, dy: 0 },
  { x: 9, y: 8, dx: 0, dy: 1 },
  { x: 10, y: 8, dx: 0, dy: -1 },
];

// Visual identity per ghost - color key drives both the cell fill and the
// face emoji. Kept distinct from the player so collisions read clearly.
export const GHOST_THEME = [
  { glyph: "👻", colorClass: "bg-coral-600/80", label: "blinky" },
  { glyph: "👾", colorClass: "bg-violet-600/80", label: "pinky" },
  { glyph: "🫧", colorClass: "bg-amber-600/80", label: "inky" },
  { glyph: "💀", colorClass: "bg-violet-800/80", label: "clyde" },
];

export const POINTS = {
  DOT: 10,
  POWER: 50,
  GHOST: 200,
  LEVEL_CLEAR: 500,
};

export const TICK_MS = 200;

// Difficulty presets. Each defines a baseline ghost speed (ms per ghost
// step — lower is faster), how many power-up ticks you get, and how many
// starting lives. Level-ramp then nudges these further as you progress.
export const DIFFICULTY = {
  easy: {
    label: "easy",
    baseGhostMoveMs: 460,
    basePowerTicks: 45,
    lives: 4,
  },
  normal: {
    label: "normal",
    baseGhostMoveMs: 380,
    basePowerTicks: 35,
    lives: 3,
  },
  hard: {
    label: "hard",
    baseGhostMoveMs: 300,
    basePowerTicks: 25,
    lives: 2,
  },
};

export const DEFAULT_DIFFICULTY = "normal";

// Floors so high levels stay challenging-but-fair rather than impossible.
const MIN_GHOST_MOVE_MS = 160;
const MIN_POWER_TICKS = 12;

/**
 * Per-level ramp on top of a difficulty preset. Ghosts speed up ~4% per
 * level (capped at a floor), and power-up duration shrinks ~3% per level
 * (also capped). Level 1 always matches the preset's base values exactly.
 */
export function getLevelTimings(difficultyKey, level) {
  const preset = DIFFICULTY[difficultyKey] ?? DIFFICULTY[DEFAULT_DIFFICULTY];
  const steps = Math.max(0, level - 1);

  const ghostMoveMs = Math.max(
    MIN_GHOST_MOVE_MS,
    Math.round(preset.baseGhostMoveMs * Math.pow(0.96, steps))
  );
  const powerTicks = Math.max(
    MIN_POWER_TICKS,
    Math.round(preset.basePowerTicks * Math.pow(0.97, steps))
  );

  return { ghostMoveMs, powerTicks, lives: preset.lives };
}

export const STARTING_LIVES = 3;
