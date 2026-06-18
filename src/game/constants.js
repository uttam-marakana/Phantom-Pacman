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

export const TIMINGS = {
  GHOST_MOVE_MS: 380,
  TICK_MS: 200,
  POWER_DURATION_TICKS: 35, // ~7s at 200ms tick
};

export const STARTING_LIVES = 3;
