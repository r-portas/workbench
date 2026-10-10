import { useEffect, useState } from "react";

// Relative times change per minute at most ("5m ago"), so a faster tick would re-render the same text
const TICK_MS = 60_000;

/**
 * The current time in ms, updated every minute, so relative times keep counting up while the page
 * stays open.
 */
export function useNow(): number {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  return now;
}
