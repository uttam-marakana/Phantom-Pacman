import { useCallback, useEffect, useState } from "react";
import {
  getAudioPrefs,
  setMuted as setMutedLib,
  setVolume as setVolumeLib,
  startMusic,
  stopMusic,
  unlockAudio,
} from "../lib/sound";

export function useSound() {
  const [prefs, setPrefs] = useState(getAudioPrefs);

  const toggleMute = useCallback(() => {
    const next = !prefs.muted;
    setMutedLib(next);
    setPrefs((p) => ({ ...p, muted: next }));
  }, [prefs.muted]);

  const changeVolume = useCallback((volume) => {
    setVolumeLib(volume);
    setPrefs((p) => ({ ...p, volume }));
  }, []);

  const unlock = useCallback(() => {
    unlockAudio();
  }, []);

  useEffect(() => {
    return () => stopMusic();
  }, []);

  const playMusic = useCallback(() => startMusic(), []);
  const pauseMusic = useCallback(() => stopMusic(), []);

  return { prefs, toggleMute, changeVolume, unlock, playMusic, pauseMusic };
}
