export default function Hud({ score, lives, level, message, soundControls }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between font-mono text-lg sm:text-xl flex-1">
          <div className="flex items-center gap-2">
            <span className="text-violet-200/70 text-xs uppercase tracking-widest">
              score
            </span>
            <span className="text-amber-400 font-display text-sm sm:text-base">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1" aria-label={`${lives} lives remaining`}>
            {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
              <span key={i} aria-hidden="true">
                ❤️
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-violet-200/70 text-xs uppercase tracking-widest">
              level
            </span>
            <span className="text-violet-200">{level}</span>
          </div>
        </div>
        {soundControls && <div className="ml-3 shrink-0">{soundControls}</div>}
      </div>
      <p className="h-5 text-center text-sm text-violet-200/80 font-mono">
        {message}
      </p>
    </div>
  );
}
