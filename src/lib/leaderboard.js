// Leaderboard service.
//
// Stores scores in a Firestore collection called "scores", one document per
// run, with fields: { name, score, level, createdAt }.
//
// If Firestore is unreachable (e.g. placeholder config not yet replaced),
// calls fall back to localStorage so the game still works end-to-end during
// development.

import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const LOCAL_KEY = "ghost-game-leaderboard";
const SCORES_COLLECTION = "scores";
const TOP_N = 10;

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocal(entries) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(entries));
  } catch {
    // localStorage unavailable (private mode, quota, etc) - ignore.
  }
}

function addLocalScore(entry) {
  const entries = readLocal();
  entries.push({ ...entry, createdAt: Date.now() });
  entries.sort((a, b) => b.score - a.score);
  writeLocal(entries.slice(0, TOP_N));
  return entries.slice(0, TOP_N);
}

/**
 * Submit a score. Returns the top N leaderboard entries after insertion.
 * @param {{ name: string, score: number, level: number, difficulty?: string }} entry
 */
export async function submitScore(entry) {
  const clean = {
    name: (entry.name || "anon").slice(0, 16),
    score: Math.max(0, Math.floor(entry.score || 0)),
    level: Math.max(1, Math.floor(entry.level || 1)),
    difficulty: entry.difficulty || "normal",
  };

  try {
    await addDoc(collection(db, SCORES_COLLECTION), {
      ...clean,
      createdAt: serverTimestamp(),
    });
    return await fetchTopScores();
  } catch (err) {
    console.warn(
      "Firestore submitScore failed, falling back to localStorage:",
      err?.message
    );
    return addLocalScore(clean);
  }
}

/**
 * Fetch the top N scores, highest first.
 */
export async function fetchTopScores() {
  try {
    const q = query(
      collection(db, SCORES_COLLECTION),
      orderBy("score", "desc"),
      limit(TOP_N)
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn(
      "Firestore fetchTopScores failed, falling back to localStorage:",
      err?.message
    );
    return readLocal();
  }
}
