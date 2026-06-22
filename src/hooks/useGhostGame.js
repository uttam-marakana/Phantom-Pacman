import { useCallback, useEffect, useRef, useState } from "react";
import {
  CELL,
  DEFAULT_DIFFICULTY,
  GHOST_START,
  MAZE_TEMPLATE,
  PLAYER_START,
  POINTS,
  TICK_MS,
  getLevelTimings,
} from "../game/constants";
import {
  canMove,
  cloneMaze,
  countRemainingPellets,
  pickGhostDirection,
} from "../game/logic";
import { sfx } from "../lib/sound";

function freshState(difficulty) {
  const timings = getLevelTimings(difficulty, 1);
  return {
    maze: cloneMaze(MAZE_TEMPLATE),
    player: { ...PLAYER_START },
    ghosts: GHOST_START.map((g) => ({ ...g, eaten: false })),
    score: 0,
    lives: timings.lives,
    level: 1,
    powered: false,
    powerTicks: 0,
    difficulty,
    status: "ready", // ready | playing | paused | game-over
    message: "Use arrow keys or the on-screen pad",
  };
}

export function useGhostGame(initialDifficulty = DEFAULT_DIFFICULTY) {
  const [state, setState] = useState(() => freshState(initialDifficulty));
  const stateRef = useRef(state);
  stateRef.current = state;

  const ghostIntervalRef = useRef(null);
  const tickIntervalRef = useRef(null);

  const start = useCallback((difficulty) => {
    setState((s) => ({
      ...freshState(difficulty ?? s.difficulty),
      status: "playing",
      message: "",
    }));
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

      const timings = getLevelTimings(s.difficulty, s.level);
      const maze = cloneMaze(s.maze);
      let score = s.score;
      let powered = s.powered;
      let powerTicks = s.powerTicks;
      let message = "";

      const cell = maze[ny][nx];
      if (cell === CELL.DOT) {
        score += POINTS.DOT;
        maze[ny][nx] = CELL.EMPTY;
        sfx.dot();
      } else if (cell === CELL.POWER) {
        score += POINTS.POWER;
        maze[ny][nx] = CELL.EMPTY;
        powered = true;
        powerTicks = timings.powerTicks;
        message = "Powered up — hunt the ghosts!";
        sfx.power();
      }

      const player = { x: nx, y: ny };

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
            sfx.ghostEaten();
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
        if (lives <= 0) {
          status = "game-over";
          sfx.gameOver();
        } else {
          sfx.death();
        }
      }

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
        sfx.levelUp();
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

  // Ghost movement loop — interval duration follows the current level's
  // ramped speed, so it's re-armed whenever level or difficulty changes.
  useEffect(() => {
    function tick() {
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
              sfx.ghostEaten();
              return { ...g, eaten: true };
            }
            lives -= 1;
            player = { ...PLAYER_START };
            if (lives <= 0) {
              status = "game-over";
              message = "";
              sfx.gameOver();
            } else {
              message = "Caught! Watch out...";
              sfx.death();
            }
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
    }

    const timings = getLevelTimings(state.difficulty, state.level);
    ghostIntervalRef.current = setInterval(tick, timings.ghostMoveMs);
    return () => clearInterval(ghostIntervalRef.current);
  }, [state.difficulty, state.level]);

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
    }, TICK_MS);

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
