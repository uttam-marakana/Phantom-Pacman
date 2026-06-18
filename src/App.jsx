import { useGhostGame } from "./hooks/useGhostGame";
import { useLeaderboard } from "./hooks/useLeaderboard";
import Marquee from "./components/Marquee";
import Hud from "./components/Hud";
import MazeGrid from "./components/MazeGrid";
import ControlPad from "./components/ControlPad";
import Leaderboard from "./components/Leaderboard";
import StartOverlay from "./components/StartOverlay";
import GameOverOverlay from "./components/GameOverOverlay";

export default function App() {
  const { state, move, start } = useGhostGame();
  const { scores, loading, submitting, submit } = useLeaderboard();

  const { maze, player, ghosts, score, lives, level, powered, status, message } = state;

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-md">
        <Marquee />

        <Hud score={score} lives={lives} level={level} message={message} />

        <div className="relative mt-3">
          <MazeGrid maze={maze} player={player} ghosts={ghosts} powered={powered} />

          {status === "ready" && <StartOverlay onStart={start} />}

          {status === "game-over" && (
            <GameOverOverlay
              score={score}
              level={level}
              submitting={submitting}
              onSubmit={submit}
              onRestart={start}
            />
          )}
        </div>

        <div className="mt-5">
          <ControlPad onMove={move} />
        </div>

        <div className="mt-8">
          <Leaderboard scores={scores} loading={loading} />
        </div>

        <p className="text-center text-violet-200/30 text-xs font-mono mt-8">
          space to pause &middot; arrow keys or wasd to move
        </p>
      </div>
    </div>
  );
}
