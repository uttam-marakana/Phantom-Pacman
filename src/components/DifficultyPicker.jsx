import { DIFFICULTY } from "../game/constants";

export default function DifficultyPicker({ value, onChange }) {
  return (
    <div className="flex items-center justify-center gap-2" role="radiogroup" aria-label="Difficulty">
      {Object.entries(DIFFICULTY).map(([key, preset]) => {
        const active = key === value;
        return (
          <button
            key={key}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(key)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono tracking-wide border transition ${
              active
                ? "bg-amber-400 text-ink border-amber-400"
                : "bg-panel text-violet-200/70 border-violet-600/40 hover:border-violet-400"
            }`}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
