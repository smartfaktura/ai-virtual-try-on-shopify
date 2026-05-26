import { lazy, type ComponentType } from 'react';

/**
 * Wraps React.lazy so that a stale/missing chunk after a deploy
 * triggers ONE silent page reload instead of flashing the
 * ErrorBoundary's "Something went wrong" card.
 *
 * - A sessionStorage one-shot flag prevents any reload loop.
 * - Non-chunk errors are rethrown unchanged (same behavior as React.lazy).
 */
const RELOAD_FLAG = 'lazy_chunk_reloaded';

function isChunkLoadError(err: unknown): boolean {
  const msg = err instanceof Error ? `${err.name} ${err.message}` : String(err ?? '');
  return /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    msg
  );
}

export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      if (typeof window !== 'undefined' && isChunkLoadError(err)) {
        let alreadyReloaded = false;
        try {
          alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG) === '1';
        } catch {
          // sessionStorage may be unavailable; fall through and rethrow
        }
        if (!alreadyReloaded) {
          try { sessionStorage.setItem(RELOAD_FLAG, '1'); } catch {}
          window.location.reload();
          // Return a never-resolving promise so Suspense keeps the
          // fallback shown until the reload happens.
          return new Promise<{ default: T }>(() => {});
        }
      }
      throw err;
    }
  });
}

/**
 * Call once on successful app boot (after the initial render) to clear
 * the one-shot flag so future stale chunks can be auto-recovered again.
 */
export function clearLazyReloadFlag() {
  try { sessionStorage.removeItem(RELOAD_FLAG); } catch {}
}
