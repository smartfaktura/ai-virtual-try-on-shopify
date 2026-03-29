import { useState, useEffect } from 'react';

/**
 * Returns a tick counter that increments on a regular interval AND
 * immediately when the page becomes visible again (un-throttled by mobile browsers).
 */
export function useVisibilityTick(intervalMs: number, enabled: boolean): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const bump = () => setTick((t) => t + 1);
    const interval = setInterval(bump, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === 'visible') bump();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs, enabled]);

  return tick;
}
