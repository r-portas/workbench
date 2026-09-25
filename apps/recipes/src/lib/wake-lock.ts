import { useEffect, useSyncExternalStore } from "react";

// Support never changes at runtime, so there's nothing to subscribe to.
const subscribeNever = () => () => {};

/**
 * Whether the browser supports the Screen Wake Lock API.
 *
 * @remarks
 * Always `false` during SSR and hydration, so prerendered HTML matches the first client render.
 */
export function useWakeLockSupported(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => "wakeLock" in navigator,
    () => false,
  );
}

/**
 * Keeps the screen awake while `enabled` is true.
 *
 * @param enabled - Whether to hold the wake lock.
 *
 * @remarks
 * The browser drops the lock whenever the page is hidden (tab switch, phone locked), so it's
 * re-requested when the page becomes visible again. Failures (e.g. low-power mode) are ignored.
 *
 * @example
 * ```ts
 * const [cooking, setCooking] = useState(false);
 * useWakeLock(cooking);
 * ```
 */
export function useWakeLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | undefined;
    // Guards against overlapping requests leaking a lock we'd never release.
    let requesting = false;
    let disposed = false;

    async function acquire() {
      if (requesting || document.visibilityState !== "visible") return;
      if (sentinel && !sentinel.released) return;
      requesting = true;
      try {
        const lock = await navigator.wakeLock.request("screen");
        // The effect may have been cleaned up while the request was in flight.
        if (disposed) void lock.release();
        else sentinel = lock;
      } catch {
        // Not critical: the screen just sleeps as normal.
      } finally {
        requesting = false;
      }
    }

    void acquire();
    document.addEventListener("visibilitychange", acquire);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", acquire);
      void sentinel?.release();
    };
  }, [enabled]);
}
