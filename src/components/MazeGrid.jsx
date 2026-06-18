import { CELL, COLS, ROWS, GHOST_THEME } from "../game/constants";

function Cell({ value }) {
  if (value === CELL.WALL) {
    return <div className="bg-violet-800/90 border border-ink" />;
  }
  if (value === CELL.DOT) {
    return (
      <div className="relative flex items-center justify-center">
        <span className="w-1 h-1 rounded-full bg-violet-200/70" />
      </div>
    );
  }
  if (value === CELL.POWER) {
    return (
      <div className="relative flex items-center justify-center">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 pulse-glow" />
      </div>
    );
  }
  return <div />;
}

export default function MazeGrid({ maze, player, ghosts, powered }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-violet-600/40 bg-ink-2 crt-vignette scanlines"
      style={{ aspectRatio: `${COLS} / ${ROWS}` }}
      role="img"
      aria-label="Game maze"
    >
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {maze.map((row, r) =>
          row.map((value, c) => <Cell key={`${r}-${c}`} value={value} />)
        )}
      </div>

      {/* Player */}
      <div
        className="absolute flex items-center justify-center text-[3vw] sm:text-base transition-[left,top] duration-100 ease-linear"
        style={{
          width: `${100 / COLS}%`,
          height: `${100 / ROWS}%`,
          left: `${(player.x / COLS) * 100}%`,
          top: `${(player.y / ROWS) * 100}%`,
        }}
        aria-hidden="true"
      >
        😮
      </div>

      {/* Ghosts */}
      {ghosts.map((g, i) =>
        g.eaten ? null : (
          <div
            key={i}
            className="absolute flex items-center justify-center text-[2.6vw] sm:text-sm transition-[left,top] duration-150 ease-linear"
            style={{
              width: `${100 / COLS}%`,
              height: `${100 / ROWS}%`,
              left: `${(g.x / COLS) * 100}%`,
              top: `${(g.y / ROWS) * 100}%`,
            }}
            aria-hidden="true"
          >
            {powered ? "💙" : GHOST_THEME[i].glyph}
          </div>
        )
      )}
    </div>
  );
}
