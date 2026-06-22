import { useCallback, useEffect, useRef, useState } from "react";
import {
  CELL,
  GHOST_START,
  MAZE_TEMPLATE,
  PLAYER_START,
  POINTS,
  getLevelTimings,
} from "../game/constants";
import {
  canMove,
  cloneMaze,
  countRemainingPellets,
  pickGhostDirection,
  resolvePlayerGhostCollision,
} from "../game/logic";
import {
  createRoom,
  getOrCreatePlayerId,
  joinRoom,
  leaveRoom,
  pushInput,
  pushRoomState,
  subscribeToRoom,
} from "../lib/rooms";
import { sfx } from "../lib/sound";

// Guest spawns on the opposite side of the maze from the host so the two
// players don't start stacked on each other.
const GUEST_START = { x: 9, y: 6 };

function freshRoomState(difficulty) {
  const timings = getLevelTimings(difficulty, 1);
  return {
    maze: cloneMaze(MAZE_TEMPLATE),
    players: { host: { ...PLAYER_START }, guest: { ...GUEST_START } },
    ghosts: GHOST_START.map((g) => ({ ...g, eaten: false })),
    score: 0,
    lives: timings.lives,
    level: 1,
    difficulty,
    powered: false,
    powerTicks: 0,
    inputs: { host: { dx: 0, dy: 0, seq: 0 }, guest: { dx: 0, dy: 0, seq: 0 } },
    message: "Waiting for a second player…",
  };
}

export function useOnlineGame(difficulty) {
  const playerId = useRef(getOrCreatePlayerId());
  const [role, setRole] = useState(null); // 'host' | 'guest' | null
  const [roomId, setRoomId] = useState(null);
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");

  const seqRef = useRef(0);
  const hostLoopRef = useRef(null);
  const unsubRef = useRef(null);

  const cleanupSubscription = useCallback(() => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
  }, []);

  const hostGame = useCallback(async () => {
    setError("");
    const initial = freshRoomState(difficulty);
    const id = await createRoom(initial, playerId.current);
    setRoomId(id);
    setRole("host");
  }, [difficulty]);

  const joinGame = useCallback(async (code) => {
    setError("");
    try {
      const id = await joinRoom(code, playerId.current);
      setRoomId(id);
      setRole("guest");
    } catch (err) {
      setError("Couldn't join that room — check the code and try again.");
    }
  }, []);

  const leave = useCallback(() => {
    if (roomId && role) leaveRoom(roomId, role);
    cleanupSubscription();
    clearInterval(hostLoopRef.current);
    setRoom(null);
    setRoomId(null);
    setRole(null);
  }, [roomId, role, cleanupSubscription]);

  // Subscribe to room doc once we have a roomId.
  useEffect(() => {
    if (!roomId) return;
    cleanupSubscription();
    unsubRef.current = subscribeToRoom(roomId, (data) => {
      setRoom(data);
    });
    return cleanupSubscription;
  }, [roomId, cleanupSubscription]);

  // Send local input. Both host and guest call this the same way; the host
  // also folds its own input straight into its local sim loop below.
  const move = useCallback(
    (dx, dy) => {
      if (!roomId || !role) return;
      seqRef.current += 1;
      pushInput(roomId, role, dx, dy, seqRef.current);
    },
    [roomId, role]
  );

  // Host-authoritative simulation loop. Only runs when we are the host and
  // the room has a guest connected.
  useEffect(() => {
    if (role !== "host" || !room || !room.guestId) {
      clearInterval(hostLoopRef.current);
      return;
    }

    const timings = getLevelTimings(room.difficulty, room.level);

    hostLoopRef.current = setInterval(() => {
      setRoom((prev) => {
        if (!prev || prev.status === "game-over") return prev;
        const next = stepSimulation(prev);
        // Fire-and-forget push; we don't await inside setState.
        pushRoomState(roomId, next);
        return { ...prev, ...next };
      });
    }, timings.ghostMoveMs);

    return () => clearInterval(hostLoopRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, room?.guestId, room?.status, room?.level, room?.difficulty, roomId]);

  // Keyboard controls (both roles).
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
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [move]);

  // Sound cues on message changes (driven by whatever the host last wrote).
  const lastMessageRef = useRef("");
  useEffect(() => {
    if (!room || room.message === lastMessageRef.current) return;
    lastMessageRef.current = room.message;
    if (room.message?.includes("Ghost eaten")) sfx.ghostEaten();
    else if (room.message?.includes("Powered up")) sfx.power();
    else if (room.message?.startsWith("Level")) sfx.levelUp();
    else if (room.status === "game-over") sfx.gameOver();
  }, [room?.message, room?.status]);

  return {
    role,
    roomId,
    room,
    error,
    hostGame,
    joinGame,
    leave,
    move,
    isHost: role === "host",
    isGuest: role === "guest",
  };
}

/**
 * Pure-ish step function: takes the current room doc and returns the
 * patch to apply/push for one simulation tick. Reads the most recent
 * `inputs.host` / `inputs.guest` directions, applies movement, resolves
 * pellet pickups and collisions for both players, then steps ghosts.
 */
function stepSimulation(room) {
  let maze = cloneMaze(room.maze);
  let score = room.score;
  let powered = room.powered;
  let powerTicks = room.powerTicks;
  let message = "";
  let lives = room.lives;
  let status = room.status ?? "playing";

  const players = { host: { ...room.players.host }, guest: { ...room.players.guest } };

  for (const who of ["host", "guest"]) {
    const input = room.inputs?.[who];
    if (!input || (input.dx === 0 && input.dy === 0)) continue;
    const p = players[who];
    const nx = p.x + input.dx;
    const ny = p.y + input.dy;
    if (!canMove(maze, nx, ny)) continue;
    players[who] = { x: nx, y: ny };

    const cell = maze[ny][nx];
    if (cell === CELL.DOT) {
      score += POINTS.DOT;
      maze[ny][nx] = CELL.EMPTY;
    } else if (cell === CELL.POWER) {
      score += POINTS.POWER;
      maze[ny][nx] = CELL.EMPTY;
      powered = true;
      powerTicks = getLevelTimings(room.difficulty, room.level).powerTicks;
      message = "Powered up — hunt the ghosts!";
    }
  }

  let ghosts = room.ghosts;
  for (const who of ["host", "guest"]) {
    const result = resolvePlayerGhostCollision(ghosts, players[who], powered);
    ghosts = result.ghosts;
    if (result.ateGhost) {
      score += POINTS.GHOST;
      message = "Ghost eaten! +200";
    }
    if (result.caught) {
      lives -= 1;
      players[who] = who === "host" ? { ...PLAYER_START } : { ...GUEST_START };
      message = lives <= 0 ? "" : `${who === "host" ? "Player 1" : "Player 2"} caught!`;
      if (lives <= 0) status = "game-over";
    }
  }

  // Ghosts step on every tick here (online tick rate already approximates
  // the ramped ghost speed via the interval duration set by the caller).
  ghosts = ghosts.map((g) => (g.eaten ? g : pickGhostDirection(maze, g)));

  let level = room.level;
  if (countRemainingPellets(maze) === 0 && status === "playing") {
    score += POINTS.LEVEL_CLEAR;
    level += 1;
    maze = cloneMaze(MAZE_TEMPLATE);
    players.host = { ...PLAYER_START };
    players.guest = { ...GUEST_START };
    ghosts = GHOST_START.map((g) => ({ ...g, eaten: false }));
    powered = false;
    powerTicks = 0;
    message = `Level ${level}!`;
  }

  if (powered) {
    powerTicks -= 1;
    if (powerTicks <= 0) {
      powered = false;
      powerTicks = 0;
      ghosts = ghosts.map((g) => ({ ...g, eaten: false }));
    }
  }

  return {
    maze,
    players,
    ghosts,
    score,
    lives,
    level,
    powered,
    powerTicks,
    status,
    message,
  };
}
