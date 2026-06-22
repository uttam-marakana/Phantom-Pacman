// Lightweight sound engine built on the Web Audio API. Everything is
// synthesized at runtime (oscillators + noise), so there are no binary
// audio assets to ship or license. Volume/mute preference persists in
// localStorage.

const STORAGE_KEY = "ghost-game-audio";

let ctx = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;
let musicNodes = null; // { stop() } handle for the running loop
let unlocked = false;

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { muted: false, volume: 0.6 };
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

let prefs = loadPrefs();

function ensureContext() {
  if (ctx) return ctx;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  ctx = new AudioCtx();
  masterGain = ctx.createGain();
  musicGain = ctx.createGain();
  sfxGain = ctx.createGain();
  musicGain.connect(masterGain);
  sfxGain.connect(masterGain);
  masterGain.connect(ctx.destination);
  applyVolume();
  return ctx;
}

function applyVolume() {
  if (!masterGain) return;
  masterGain.gain.value = prefs.muted ? 0 : prefs.volume;
}

/**
 * Must be called from a user gesture (click/keydown) before any sound will
 * play in browsers that require it. Safe to call repeatedly.
 */
export function unlockAudio() {
  const c = ensureContext();
  if (!c) return;
  if (c.state === "suspended") c.resume();
  unlocked = true;
}

export function isAudioUnlocked() {
  return unlocked;
}

export function getAudioPrefs() {
  return { ...prefs };
}

export function setMuted(muted) {
  prefs = { ...prefs, muted };
  savePrefs(prefs);
  applyVolume();
}

export function setVolume(volume) {
  prefs = { ...prefs, volume: Math.min(1, Math.max(0, volume)) };
  savePrefs(prefs);
  applyVolume();
}

function tone({ freq, duration, type = "square", gain = 0.2, slideTo = null, delay = 0 }) {
  const c = ensureContext();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo !== null) {
    osc.frequency.linearRampToValueAtTime(slideTo, t0 + duration);
  }
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(g);
  g.connect(sfxGain);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export const sfx = {
  dot() {
    tone({ freq: 520, duration: 0.06, type: "square", gain: 0.12 });
  },
  power() {
    tone({ freq: 220, duration: 0.3, type: "sawtooth", gain: 0.18, slideTo: 440 });
  },
  ghostEaten() {
    tone({ freq: 880, duration: 0.18, type: "square", gain: 0.18, slideTo: 1320 });
    tone({ freq: 660, duration: 0.18, type: "square", gain: 0.14, delay: 0.06, slideTo: 990 });
  },
  death() {
    tone({ freq: 300, duration: 0.5, type: "sawtooth", gain: 0.2, slideTo: 60 });
  },
  levelUp() {
    [0, 0.1, 0.2].forEach((delay, i) => {
      tone({ freq: 440 + i * 110, duration: 0.16, type: "triangle", gain: 0.16, delay });
    });
  },
  gameOver() {
    [0, 0.18, 0.36].forEach((delay, i) => {
      tone({ freq: 220 - i * 40, duration: 0.3, type: "sawtooth", gain: 0.16, delay });
    });
  },
  uiClick() {
    tone({ freq: 700, duration: 0.04, type: "square", gain: 0.1 });
  },
};

/**
 * Minimal looping background bed: a soft arpeggio over a slow bassline.
 * Built from a handful of scheduled oscillators per bar, re-scheduled on
 * an interval so it can run indefinitely without growing a giant buffer.
 */
export function startMusic() {
  const c = ensureContext();
  if (!c || musicNodes) return;

  const bar = 1.6; // seconds per bar
  const bassFreqs = [110, 110, 130.8, 98];
  const arpFreqs = [330, 392, 440, 392];
  let barIndex = 0;
  let stopped = false;

  function scheduleBar(startTime) {
    const bassFreq = bassFreqs[barIndex % bassFreqs.length];
    const bassOsc = c.createOscillator();
    const bassGain = c.createGain();
    bassOsc.type = "triangle";
    bassOsc.frequency.value = bassFreq;
    bassGain.gain.setValueAtTime(0.0001, startTime);
    bassGain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
    bassGain.gain.linearRampToValueAtTime(0.0001, startTime + bar * 0.9);
    bassOsc.connect(bassGain);
    bassGain.connect(musicGain);
    bassOsc.start(startTime);
    bassOsc.stop(startTime + bar);

    for (let i = 0; i < 4; i++) {
      const t = startTime + (i * bar) / 4;
      const freq = arpFreqs[(barIndex + i) % arpFreqs.length];
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + bar / 4 - 0.02);
      osc.connect(g);
      g.connect(musicGain);
      osc.start(t);
      osc.stop(t + bar / 4);
    }

    barIndex++;
  }

  let nextBarTime = c.currentTime + 0.05;
  scheduleBar(nextBarTime);
  nextBarTime += bar;
  scheduleBar(nextBarTime);
  nextBarTime += bar;

  const intervalId = setInterval(() => {
    if (stopped) return;
    scheduleBar(nextBarTime);
    nextBarTime += bar;
  }, bar * 1000);

  musicNodes = {
    stop() {
      stopped = true;
      clearInterval(intervalId);
    },
  };
}

export function stopMusic() {
  if (musicNodes) {
    musicNodes.stop();
    musicNodes = null;
  }
}
