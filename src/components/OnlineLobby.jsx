import { useState } from "react";

export default function OnlineLobby({ onHost, onJoin, error, difficultyPicker }) {
  const [code, setCode] = useState("");

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/90 backdrop-blur-sm rounded-lg">
      <div className="flex flex-col items-center gap-4 px-6 text-center w-full max-w-[260px]">
        <p className="font-display text-xs text-amber-400 tracking-widest">online co-op</p>

        {difficultyPicker}

        <button
          onClick={onHost}
          className="w-full bg-amber-400 hover:bg-amber-200 text-ink font-display text-xs px-4 py-3 rounded-md tracking-widest transition"
        >
          host a room
        </button>

        <div className="flex items-center gap-2 w-full text-violet-200/40 text-xs">
          <span className="flex-1 h-px bg-violet-600/30" />
          or
          <span className="flex-1 h-px bg-violet-600/30" />
        </div>

        <form
          className="flex flex-col gap-2 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) onJoin(code.trim());
          }}
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="room code"
            maxLength={5}
            className="bg-panel border border-violet-600/50 rounded-md px-3 py-2 text-sm font-mono text-center tracking-[0.3em] text-violet-50 placeholder:text-violet-200/40 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <button
            type="submit"
            disabled={!code.trim()}
            className="bg-violet-600 hover:bg-violet-600/80 disabled:opacity-40 disabled:cursor-not-allowed text-violet-50 text-sm font-mono rounded-md px-3 py-2 transition"
          >
            join room
          </button>
        </form>

        {error && <p className="text-coral-400 text-xs font-mono">{error}</p>}
      </div>
    </div>
  );
}
