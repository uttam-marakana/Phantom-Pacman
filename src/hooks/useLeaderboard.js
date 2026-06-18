import { useCallback, useEffect, useState } from "react";
import { fetchTopScores, submitScore } from "../lib/leaderboard";

export function useLeaderboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const top = await fetchTopScores();
    setScores(top);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submit = useCallback(
    async (entry) => {
      setSubmitting(true);
      const top = await submitScore(entry);
      setScores(top);
      setSubmitting(false);
    },
    []
  );

  return { scores, loading, submitting, refresh, submit };
}
