// Online multiplayer room service.
//
// Model: host-authoritative. Whoever creates the room runs the real
// simulation (ghosts, collisions, pellets) locally and writes the resulting
// state to Firestore on every tick. The guest only ever writes their own
// `inputs.guest` direction and reads the room document to render — it never
// runs its own copy of the simulation, which avoids the two clients'
// ghosts/pellets diverging.
//
// Document shape at rooms/{roomId}:
// {
//   hostId, guestId,
//   status: 'waiting' | 'playing' | 'game-over',
//   difficulty, level, score, lives,
//   maze: number[][],
//   players: { host: {x,y}, guest: {x,y} },
//   ghosts: [{x,y,dx,dy,eaten}],
//   powered, powerTicks,
//   inputs: { host: {dx,dy,seq}, guest: {dx,dy,seq} },
//   message,
//   updatedAt
// }

import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { flattenMaze, unflattenMaze } from "../game/logic";
import { COLS } from "../game/constants";

function randomRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function randomPlayerId() {
  return Math.random().toString(36).slice(2, 10);
}

export function getOrCreatePlayerId() {
  const key = "ghost-game-player-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = randomPlayerId();
    localStorage.setItem(key, id);
  }
  return id;
}

/**
 * Create a new room. Returns { roomId, playerId }.
 */
export async function createRoom(initialState, hostId) {
  const roomId = randomRoomCode();
  await setDoc(doc(db, "rooms", roomId), {
    ...initialState,
    maze: flattenMaze(initialState.maze),
    hostId,
    guestId: null,
    status: "waiting",
    updatedAt: serverTimestamp(),
  });
  return roomId;
}

/**
 * Attempt to join an existing room as the guest. Throws if the room
 * doesn't exist, is already full, or has already started — caller should
 * surface that as an error.
 */
export async function joinRoom(roomId, guestId) {
  const ref = doc(db, "rooms", roomId.toUpperCase());
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Room not found");
  const data = snap.data();
  if (data.guestId && data.guestId !== guestId) {
    throw new Error("Room is full");
  }
  await updateDoc(ref, {
    guestId,
    status: "playing",
    updatedAt: serverTimestamp(),
  });
  return roomId.toUpperCase();
}

export function subscribeToRoom(roomId, callback) {
  const ref = doc(db, "rooms", roomId.toUpperCase());
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data();
    callback({
      id: snap.id,
      ...data,
      maze: data.maze ? unflattenMaze(data.maze, COLS) : data.maze,
    });
  });
}

/**
 * Host writes the full simulation state each tick. Flattens `maze` if
 * present in the patch, since Firestore can't store nested arrays.
 */
export async function pushRoomState(roomId, partialState) {
  const ref = doc(db, "rooms", roomId.toUpperCase());
  const patch = { ...partialState, updatedAt: serverTimestamp() };
  if (patch.maze) patch.maze = flattenMaze(patch.maze);
  await updateDoc(ref, patch);
}

/**
 * Either player pushes their latest desired direction. `seq` lets the host
 * ignore stale inputs if updates arrive out of order.
 */
export async function pushInput(roomId, who, dx, dy, seq) {
  const ref = doc(db, "rooms", roomId.toUpperCase());
  await updateDoc(ref, {
    [`inputs.${who}`]: { dx, dy, seq },
  });
}

export async function leaveRoom(roomId, who) {
  const ref = doc(db, "rooms", roomId.toUpperCase());
  try {
    if (who === "guest") {
      await updateDoc(ref, { guestId: null, status: "waiting" });
    } else {
      await updateDoc(ref, { status: "game-over", message: "Host left" });
    }
  } catch {
    // room may already be gone — ignore.
  }
}
