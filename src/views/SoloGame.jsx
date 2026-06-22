import { useEffect, useRef } from "react";
import { useGhostGame } from "../hooks/useGhostGame";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useSound } from "../hooks/useSound";
import Hud from "../components/Hud";
import MazeGrid from "../components/MazeGrid";
import ControlPad from "../components/ControlPad";
import Leaderboard from "../components/Leaderboard";
import StartOverlay from "../components/StartOverlay";
import GameOverOverlay from "../components/GameOverOverlay";
import SoundControls from "../components/SoundControls";

export default function SoloGame() {
  const { state, move, start, pauseToggle } = useGhostGame();
  const { scores, loading, submitting, submit } = useLeaderboard();
  const { prefs, toggleMute, changeVolume, unlock, playMusic, pauseMusic } = useSound();

  const { maze, player, ghosts, score, lives, level, difficulty, powered, status, message } = state;

  const musicStarted = useRef(false);
  useEffect(() => {
    if (status === "playing" && !musicStarted.current) {
      musicStarted.current = true;
      playMusic();
    }
    if (status === "game-over") {
      pauseMusic();
      musicStarted.current = false;
    }
  }, [status, playMusic, pauseMusic]);

  function handleStart(chosenDifficulty) {
    unlock();
    start(chosenDifficulty);
  }

  return (
    <>
      <Hud
        score={score}
        lives={lives}
        level={level}
        message={message}
        soundControls={
          <SoundControls prefs={prefs} onToggleMute={toggleMute} onChangeVolume={changeVolume} />
        }
      />

      <div className="relative mt-3">
        <MazeGrid maze={maze} player={player} ghosts={ghosts} powered={powered} />

        {status === "ready" && <StartOverlay onStart={handleStart} />}

        {status === "game-over" && (
          <GameOverOverlay
            score={score}
            level={level}
            difficulty={difficulty}
            submitting={submitting}
            onSubmit={submit}
            onRestart={() => handleStart(difficulty)}
          />
        )}
      </div>

      <div className="mt-5">
        <ControlPad onMove={move} />
      </div>

      {status === "playing" && (
        <button
          onClick={pauseToggle}
          className="mt-3 mx-auto block text-xs font-mono text-violet-200/50 hover:text-violet-200/80 transition"
        >
          {status === "paused" ? "resume" : "pause"}
        </button>
      )}

      <div className="mt-8">
        <Leaderboard scores={scores} loading={loading} />
      </div>

      <p className="text-center text-violet-200/30 text-xs font-mono mt-8">
        space to pause &middot; arrow keys or wasd to move
      </p>
    </>
  );
}
