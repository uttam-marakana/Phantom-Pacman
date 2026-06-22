export default function ModePicker({ mode, onChange }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4" role="radiogroup" aria-label="Game mode">
      <button
        role="radio"
        aria-checked={mode === "solo"}
        onClick={() => onChange("solo")}
        className={`px-4 py-1.5 rounded-md text-xs font-mono tracking-wide border transition ${
          mode === "solo"
            ? "bg-violet-600 text-violet-50 border-violet-600"
            : "bg-panel text-violet-200/70 border-violet-600/40 hover:border-violet-400"
        }`}
      >
        solo
      </button>
      <button
        role="radio"
        aria-checked={mode === "online"}
        onClick={() => onChange("online")}
        className={`px-4 py-1.5 rounded-md text-xs font-mono tracking-wide border transition ${
          mode === "online"
            ? "bg-violet-600 text-violet-50 border-violet-600"
            : "bg-panel text-violet-200/70 border-violet-600/40 hover:border-violet-400"
        }`}
      >
        online co-op
      </button>
    </div>
  );
}
