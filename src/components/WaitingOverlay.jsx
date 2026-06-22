export default function WaitingOverlay({ roomId, onLeave }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/90 backdrop-blur-sm rounded-lg">
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <p className="font-mono text-sm text-violet-200/70">Share this code with a friend:</p>
        <p className="font-display text-2xl text-amber-400 tracking-[0.3em]">{roomId}</p>
        <p className="font-mono text-xs text-violet-200/50 pulse-glow">waiting for player 2…</p>
        <button
          onClick={onLeave}
          className="mt-2 text-sm font-mono text-violet-200/60 underline-offset-4 hover:underline"
        >
          cancel
        </button>
      </div>
    </div>
  );
}
