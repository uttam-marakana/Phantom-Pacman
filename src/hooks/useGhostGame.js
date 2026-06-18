import { useCallback, useEffect, useRef, useState } from "react";
import {
  CELL,
  GHOST_START,
  MAZE_TEMPLATE,
  PLAYER_START,
  POINTS,
  STARTING_LIVES,
  TIMINGS,
} from "../game/constants";
import {
  canMove,
  cloneMaze,
  countRemainingPellets,
  pickGhostDirection,
} from "../game/logic";

function freshState() {
  return {
    maze: cloneMaze(MAZE_TEMPLATE),
    player: { ...PLAYER_START },
    ghosts: GHOST_START.map((g) => ({ ...g, eaten: false })),
    score: 0,
    lives: STARTING_LIVES,
    level: 1,
    powered: false,
    powerTicks: 0,
    status: "ready", // ready | playing | paused | won-level | game-over
    message: "Use arrow keys or the on-screen pad",
  };
}

export function useGhostGame() {
  const [state, setState] = useState(freshState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const ghostIntervalRef = useRef(null);
  const tickIntervalRef = useRef(null);

  const start = useCallback(() => {
    setState((s) => ({ ...freshState(), status: "playing", message: "" }));
  }, []);

  const pauseToggle = useCallback(() => {
    setState((s) => {
      if (s.status === "playing") return { ...s, status: "paused" };
      if (s.status === "paused") return { ...s, status: "playing" };
      return s;
    });
  }, []);

  const move = useCallback((dx, dy) => {
    setState((s) => {
      if (s.status !== "playing") return s;
      const nx = s.player.x + dx;
      const ny = s.player.y + dy;
      if (!canMove(s.maze, nx, ny)) return s;

      const maze = cloneMaze(s.maze);
      let score = s.score;
      let powered = s.powered;
      let powerTicks = s.powerTicks;
      let message = "";

      const cell = maze[ny][nx];
      if (cell === CELL.DOT) {
        score += POINTS.DOT;
        maze[ny][nx] = CELL.EMPTY;
      } else if (cell === CELL.POWER) {
        score += POINTS.POWER;
        maze[ny][nx] = CELL.EMPTY;
        powered = true;
        powerTicks = TIMINGS.POWER_DURATION_TICKS;
        message = "Powered up — hunt the ghosts!";
      }

      const player = { x: nx, y: ny };

      // Collision check right after the move, before ghosts step.
      let lives = s.lives;
      let ghosts = s.ghosts;
      let status = s.status;
      let collidedDeath = false;

      ghosts = ghosts.map((g) => {
        if (g.eaten) return g;
        if (g.x === player.x && g.y === player.y) {
          if (powered) {
            score += POINTS.GHOST;
            message = "Ghost eaten! +200";
            return { ...g, eaten: true };
          }
          collidedDeath = true;
        }
        return g;
      });

      let finalPlayer = player;
      if (collidedDeath) {
        lives -= 1;
        message = lives <= 0 ? "" : "Caught! Watch out...";
        finalPlayer = { ...PLAYER_START };
        if (lives <= 0) status = "game-over";
      }

      // Win check.
      const remaining = countRemainingPellets(maze);
      let level = s.level;
      let nextMaze = maze;
      let nextGhosts = ghosts;
      if (remaining === 0 && status === "playing") {
        score += POINTS.LEVEL_CLEAR;
        level += 1;
        nextMaze = cloneMaze(MAZE_TEMPLATE);
        finalPlayer = { ...PLAYER_START };
        nextGhosts = GHOST_START.map((g) => ({ ...g, eaten: false }));
        powered = false;
        powerTicks = 0;
        message = `Level ${level}!`;
      }

      return {
        ...s,
        maze: nextMaze,
        player: finalPlayer,
        ghosts: nextGhosts,
        score,
        lives,
        level,
        powered,
        powerTicks,
        status,
        message,
      };
    });
  }, []);

  // Ghost movement loop.
  useEffect(() => {
    ghostIntervalRef.current = setInterval(() => {
      setState((s) => {
        if (s.status !== "playing") return s;

        const ghosts = s.ghosts.map((g) =>
          g.eaten ? g : pickGhostDirection(s.maze, g)
        );

        let lives = s.lives;
        let status = s.status;
        let player = s.player;
        let message = s.message;
        let scoreDelta = 0;
        let nextGhosts = ghosts;

        nextGhosts = nextGhosts.map((g) => {
          if (g.eaten) return g;
          if (g.x === player.x && g.y === player.y) {
            if (s.powered) {
              scoreDelta += POINTS.GHOST;
              message = "Ghost eaten! +200";
              return { ...g, eaten: true };
            }
            lives -= 1;
            player = { ...PLAYER_START };
            message = lives <= 0 ? "" : "Caught! Watch out...";
            if (lives <= 0) status = "game-over";
          }
          return g;
        });

        return {
          ...s,
          ghosts: nextGhosts,
          lives,
          status,
          player,
          message,
          score: s.score + scoreDelta,
        };
      });
    }, TIMINGS.GHOST_MOVE_MS);

    return () => clearInterval(ghostIntervalRef.current);
  }, []);

  // Power countdown loop.
  useEffect(() => {
    tickIntervalRef.current = setInterval(() => {
      setState((s) => {
        if (s.status !== "playing" || !s.powered) return s;
        const powerTicks = s.powerTicks - 1;
        if (powerTicks <= 0) {
          return {
            ...s,
            powered: false,
            powerTicks: 0,
            ghosts: s.ghosts.map((g) => ({ ...g, eaten: false })),
            message: "",
          };
        }
        return { ...s, powerTicks };
      });
    }, TIMINGS.TICK_MS);

    return () => clearInterval(tickIntervalRef.current);
  }, []);

  // Keyboard controls.
  useEffect(() => {
    function onKeyDown(e) {
      const map = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        w: [0, -1],
        s: [0, 1],
        a: [-1, 0],
        d: [1, 0],
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        move(dir[0], dir[1]);
      }
      if (e.key === " ") {
        e.preventDefault();
        pauseToggle();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [move, pauseToggle]);

  return { state, move, start, pauseToggle };
}
