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

function Sprite({ x, y, glyph, sizeClass, label }) {
  return (
    <div
      className={`absolute flex items-center justify-center ${sizeClass} transition-[left,top] duration-100 ease-linear`}
      style={{
        width: `${100 / COLS}%`,
        height: `${100 / ROWS}%`,
        left: `${(x / COLS) * 100}%`,
        top: `${(y / ROWS) * 100}%`,
      }}
      aria-hidden="true"
      title={label}
    >
      {glyph}
    </div>
  );
}

/**
 * `player` is always rendered as player 1. Pass `player2` to additionally
 * render a second player (used in online multiplayer) with a distinct
 * glyph so the two are easy to tell apart at a glance.
 */
export default function MazeGrid({ maze, player, player2, ghosts, powered }) {
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

      <Sprite x={player.x} y={player.y} glyph="😮" sizeClass="text-[3vw] sm:text-base" label="Player 1" />

      {player2 && (
        <Sprite x={player2.x} y={player2.y} glyph="😎" sizeClass="text-[3vw] sm:text-base" label="Player 2" />
      )}

      {ghosts.map((g, i) =>
        g.eaten ? null : (
          <Sprite
            key={i}
            x={g.x}
            y={g.y}
            glyph={powered ? "💙" : GHOST_THEME[i].glyph}
            sizeClass="text-[2.6vw] sm:text-sm"
            label={GHOST_THEME[i].label}
          />
        )
      )}
    </div>
  );
}
