import { useState } from "react";

export default function GameOverOverlay({ score, level, difficulty, onSubmit, onRestart, submitting }) {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || submitted) return;
    setSubmitted(true);
    onSubmit({ name: name.trim(), score, level, difficulty });
  }

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/90 backdrop-blur-sm rounded-lg">
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <p className="font-display text-xs sm:text-sm text-coral-400 tracking-widest">
          game over
        </p>
        <p className="font-mono text-2xl text-amber-400">
          {score.toLocaleString()} pts
        </p>
        <p className="font-mono text-sm text-violet-200/60">reached level {level}</p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full max-w-[220px] mt-2">
            <input
              autoFocus
              maxLength={16}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="your name"
              className="bg-panel border border-violet-600/50 rounded-md px-3 py-2 text-sm font-mono text-violet-50 placeholder:text-violet-200/40 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <button
              type="submit"
              disabled={!name.trim() || submitting}
              className="bg-violet-600 hover:bg-violet-600/80 disabled:opacity-40 disabled:cursor-not-allowed text-violet-50 text-sm font-mono rounded-md px-3 py-2 transition"
            >
              {submitting ? "saving…" : "save score"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-violet-200/70 font-mono">Score saved ✓</p>
        )}

        <button
          onClick={onRestart}
          className="mt-2 text-sm font-mono text-amber-400 underline-offset-4 hover:underline"
        >
          play again
        </button>
      </div>
    </div>
  );
}
