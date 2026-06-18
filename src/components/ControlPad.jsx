const BTN =
  "flex items-center justify-center w-11 h-11 rounded-md border border-violet-600/50 bg-panel text-violet-200 text-lg active:scale-95 active:bg-violet-600/30 transition";

export default function ControlPad({ onMove }) {
  return (
    <div
      className="grid grid-cols-3 grid-rows-2 gap-1 mx-auto w-fit"
      role="group"
      aria-label="Movement controls"
    >
      <button
        className={`${BTN} col-start-2 row-start-1`}
        onClick={() => onMove(0, -1)}
        aria-label="Move up"
      >
        ↑
      </button>
      <button
        className={`${BTN} col-start-1 row-start-2`}
        onClick={() => onMove(-1, 0)}
        aria-label="Move left"
      >
        ←
      </button>
      <button
        className={`${BTN} col-start-2 row-start-2`}
        onClick={() => onMove(0, 1)}
        aria-label="Move down"
      >
        ↓
      </button>
      <button
        className={`${BTN} col-start-3 row-start-2`}
        onClick={() => onMove(1, 0)}
        aria-label="Move right"
      >
        →
      </button>
    </div>
  );
}
