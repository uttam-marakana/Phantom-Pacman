# Ghost — arcade chase

A small Pac-Man-style maze chase built with React, Vite, and Tailwind CSS,
with a global high-score leaderboard backed by Firebase Firestore.

## Stack

- React 19 + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`, no separate config file needed)
- Firebase (Firestore) for the leaderboard, with a localStorage fallback if
  Firestore isn't reachable

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

## Connecting your Firebase project

The leaderboard reads/writes a `scores` collection in Firestore. To wire up
your own project:

1. Create a project at https://console.firebase.google.com, enable
   **Firestore Database** (start in test mode, then lock down rules before
   shipping — see below).
2. In Project settings → General → Your apps, register a web app and copy
   the config object.
3. Paste those values into `src/lib/firebase.js`, replacing the
   `YOUR_...` placeholders.

That's it — no other code changes needed. Until you do this, the app runs
fully offline and stores scores in `localStorage` instead, so the game and
UI work end-to-end without any setup.

### Suggested Firestore rules

Lock writes down to just the shape you expect, and disallow score edits/
deletes from the client:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scores/{scoreId} {
      allow read: if true;
      allow create: if request.resource.data.keys().hasOnly(['name', 'score', 'level', 'createdAt'])
                    && request.resource.data.name is string
                    && request.resource.data.name.size() <= 16
                    && request.resource.data.score is int
                    && request.resource.data.score >= 0
                    && request.resource.data.level is int;
      allow update, delete: if false;
    }
  }
}
```

## Project structure

```
src/
  game/
    constants.js      maze layout, timings, points, ghost theme
    logic.js           pure helper functions (movement, collisions, win check)
  hooks/
    useGhostGame.js     all game state + tick loops (the engine)
    useLeaderboard.js   leaderboard fetch/submit state
  lib/
    firebase.js         Firebase app init — put your config here
    leaderboard.js       Firestore reads/writes + localStorage fallback
  components/
    Marquee.jsx          title header
    Hud.jsx              score / lives / level display
    MazeGrid.jsx         the playfield itself
    ControlPad.jsx       on-screen directional buttons
    StartOverlay.jsx     pre-game overlay
    GameOverOverlay.jsx  post-game overlay + name entry
    Leaderboard.jsx      top-scores list
  App.jsx                wires everything together
```

## Controls

Arrow keys or WASD to move, space to pause. On-screen pad works on touch
devices too.

## Building for production

```bash
npm run build
```

Outputs to `dist/`. Deploy it anywhere that serves static files (Firebase
Hosting, Vercel, Netlify, etc).
