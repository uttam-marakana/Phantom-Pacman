export default function Leaderboard({ scores, loading }) {
  return (
    <div className="rounded-lg border border-violet-600/40 bg-panel p-4">
      <h2 className="font-display text-[10px] sm:text-xs text-amber-400 tracking-widest mb-3">
        high scores
      </h2>
      {loading ? (
        <p className="text-sm text-violet-200/60 font-mono">Loading…</p>
      ) : scores.length === 0 ? (
        <p className="text-sm text-violet-200/60 font-mono">
          No scores yet — be the first ghost hunter.
        </p>
      ) : (
        <ol className="space-y-1.5 font-mono text-sm">
          {scores.map((entry, i) => (
            <li
              key={entry.id ?? `${entry.name}-${entry.createdAt}-${i}`}
              className="flex items-center justify-between text-violet-100"
            >
              <span className="flex items-center gap-2 truncate">
                <span className="text-violet-200/50 w-5 text-right">
                  {i + 1}.
                </span>
                <span className="truncate">{entry.name}</span>
              </span>
              <span className="flex items-center gap-3 text-violet-200/60 shrink-0">
                <span className="text-[10px] uppercase text-violet-400">
                  {entry.difficulty ?? "normal"}
                </span>
                <span className="text-xs">lvl {entry.level}</span>
                <span className="text-amber-400 font-medium">
                  {entry.score.toLocaleString()}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
