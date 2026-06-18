import { CELL, COLS, ROWS } from "./constants";

export function cloneMaze(template) {
  return template.map((row) => [...row]);
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
