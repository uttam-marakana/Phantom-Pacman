import { useEffect, useRef, useState } from "react";
import { DEFAULT_DIFFICULTY } from "../game/constants";
import { useOnlineGame } from "../hooks/useOnlineGame";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useSound } from "../hooks/useSound";
import Hud from "../components/Hud";
import MazeGrid from "../components/MazeGrid";
import ControlPad from "../components/ControlPad";
import Leaderboard from "../components/Leaderboard";
import OnlineLobby from "../components/OnlineLobby";
import WaitingOverlay from "../components/WaitingOverlay";
import GameOverOverlay from "../components/GameOverOverlay";
import DifficultyPicker from "../components/DifficultyPicker";
import SoundControls from "../components/SoundControls";

export default function OnlineGame() {
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
  const { role, roomId, room, error, hostGame, joinGame, leave, move, isHost } =
    useOnlineGame(difficulty);
  const { scores, loading, submitting, submit } = useLeaderboard();
  const { prefs, toggleMute, changeVolume, unlock, playMusic, pauseMusic } = useSound();

  const musicStarted = useRef(false);
  useEffect(() => {
    const playing = room?.status === "playing";
    if (playing && !musicStarted.current) {
      musicStarted.current = true;
      playMusic();
    }
    if (!playing) {
      pauseMusic();
      musicStarted.current = false;
    }
  }, [room?.status, playMusic, pauseMusic]);

  function handleHost() {
    unlock();
    hostGame();
  }

  function handleJoin(code) {
    unlock();
    joinGame(code);
  }

  const inLobby = !role;
  const waitingForGuest = role === "host" && room && !room.guestId;
  const isPlaying = room && room.status === "playing";
  const isOver = room && room.status === "game-over";

  // Map host/guest onto player/player2 — whichever seat *we* occupy is
  // always drawn as "player 1" from our own perspective for clarity.
  const localPlayer = room ? (role === "host" ? room.players.host : room.players.guest) : null;
  const remotePlayer = room ? (role === "host" ? room.players.guest : room.players.host) : null;

  return (
    <>
      {room && (
        <Hud
          score={room.score ?? 0}
          lives={room.lives ?? 0}
          level={room.level ?? 1}
          message={room.message ?? ""}
          soundControls={
            <SoundControls prefs={prefs} onToggleMute={toggleMute} onChangeVolume={changeVolume} />
          }
        />
      )}

      <div className="relative mt-3">
        {room ? (
          <MazeGrid
            maze={room.maze}
            player={localPlayer}
            player2={remotePlayer}
            ghosts={room.ghosts}
            powered={room.powered}
          />
        ) : (
          <div className="aspect-[20/12] rounded-lg border border-violet-600/40 bg-ink-2" />
        )}

        {inLobby && (
          <OnlineLobby
            onHost={handleHost}
            onJoin={handleJoin}
            error={error}
            difficultyPicker={<DifficultyPicker value={difficulty} onChange={setDifficulty} />}
          />
        )}

        {waitingForGuest && <WaitingOverlay roomId={roomId} onLeave={leave} />}

        {isOver && (
          <GameOverOverlay
            score={room.score}
            level={room.level}
            difficulty={room.difficulty}
            submitting={submitting}
            onSubmit={submit}
            onRestart={leave}
          />
        )}
      </div>

      {isPlaying && (
        <div className="mt-5">
          <ControlPad onMove={move} />
        </div>
      )}

      {role && !isOver && (
        <button
          onClick={leave}
          className="mt-3 mx-auto block text-xs font-mono text-violet-200/50 hover:text-violet-200/80 transition"
        >
          leave room
        </button>
      )}

      <div className="mt-8">
        <Leaderboard scores={scores} loading={loading} />
      </div>

      <p className="text-center text-violet-200/30 text-xs font-mono mt-8">
        you're player {role === "guest" ? "2 😎" : "1 😮"} &middot; arrow keys or wasd to move
      </p>
    </>
  );
}
