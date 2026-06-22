import { CELL, COLS, ROWS } from "./constants";

export function cloneMaze(template) {
  return template.map((row) => [...row]);
}

/**
 * Firestore cannot store arrays-of-arrays, so the 2D maze grid has to be
 * flattened to a single array before writing and rebuilt after reading.
 * Used only at the Firestore boundary (see lib/rooms.js) — everywhere else
 * in game logic keeps working with the normal 2D maze[y][x] shape.
 */
export function flattenMaze(maze) {
  return maze.flat();
}

export function unflattenMaze(flat, cols = COLS) {
  const rows = [];
  for (let i = 0; i < flat.length; i += cols) {
    rows.push(flat.slice(i, i + cols));
  }
  return rows;
}

export function canMove(maze, x, y) {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
  return maze[y][x] !== CELL.WALL;
}

export function countRemainingPellets(maze) {
  let count = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (maze[r][c] === CELL.DOT || maze[r][c] === CELL.POWER) count++;
    }
  }
  return count;
}

const DIRS = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
];

/**
 * Pick a new direction for a ghost: random walk that avoids reversing
 * direction unless it's the only option (keeps movement looking purposeful
 * rather than jittery).
 */
export function pickGhostDirection(maze, ghost) {
  let options = DIRS.filter(
    (d) =>
      canMove(maze, ghost.x + d.dx, ghost.y + d.dy) &&
      !(d.dx === -ghost.dx && d.dy === -ghost.dy)
  );
  if (options.length === 0) {
    options = DIRS.filter((d) => canMove(maze, ghost.x + d.dx, ghost.y + d.dy));
  }
  if (options.length === 0) return ghost;
  const pick = options[Math.floor(Math.random() * options.length)];
  return { ...ghost, dx: pick.dx, dy: pick.dy, x: ghost.x + pick.dx, y: ghost.y + pick.dy };
}

/**
 * Check a single player's position against the ghost list. Returns
 * { ghosts, caught, ateGhost } — `ghosts` reflects any eaten-state changes.
 * Used by both the solo and host-authoritative multiplayer loops so the
 * collision rule stays in exactly one place.
 */
export function resolvePlayerGhostCollision(ghosts, player, powered) {
  let caught = false;
  let ateGhost = false;
  const nextGhosts = ghosts.map((g) => {
    if (g.eaten) return g;
    if (g.x === player.x && g.y === player.y) {
      if (powered) {
        ateGhost = true;
        return { ...g, eaten: true };
      }
      caught = true;
    }
    return g;
  });
  return { ghosts: nextGhosts, caught, ateGhost };
}
