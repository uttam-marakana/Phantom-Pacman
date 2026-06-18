export default function StartOverlay({ onStart }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/85 backdrop-blur-sm rounded-lg">
      <div className="flex flex-col items-center gap-5 px-6 text-center">
        <p className="font-mono text-sm text-violet-200/70 max-w-[260px]">
          Eat every dot. Grab the glowing pellets to turn the hunt around.
          Arrow keys, WASD, or the pad below.
        </p>
        <button
          onClick={onStart}
          className="bg-amber-400 hover:bg-amber-200 text-ink font-display text-xs px-5 py-3 rounded-md tracking-widest transition"
        >
          start
        </button>
      </div>
    </div>
  );
}
