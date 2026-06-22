export default function SoundControls({ prefs, onToggleMute, onChangeVolume }) {
  return (
    <div className="flex items-center gap-2 font-mono text-violet-200/70 text-xs">
      <button
        onClick={onToggleMute}
        aria-label={prefs.muted ? "Unmute" : "Mute"}
        className="w-8 h-8 flex items-center justify-center rounded-md border border-violet-600/40 bg-panel hover:border-violet-400 transition"
      >
        {prefs.muted ? "🔇" : "🔊"}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={prefs.volume}
        onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
        disabled={prefs.muted}
        aria-label="Volume"
        className="w-20 accent-amber-400 disabled:opacity-40"
      />
    </div>
  );
}
