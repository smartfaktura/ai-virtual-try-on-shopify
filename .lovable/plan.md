## Problem

After login, "Something went wrong" flashes for ~1 second before Dashboard loads. Console confirms the cause:

```
TypeError: Importing a module script failed
ErrorBoundary caught: ...
```

This happens at a `React.lazy()` boundary in `src/App.tsx`. After a deploy, the cached `index.html` references old hashed chunk filenames that no longer exist on the CDN. The dynamic `import()` rejects → Suspense rethrows → `ErrorBoundary` shows the error card. A moment later `versionCheck.ts` detects the new version and reloads, which is why Dashboard eventually appears.

## Safe, minimal fix (2 changes only)

### 1. New file: `src/lib/lazyWithRetry.ts`

A tiny wrapper around `React.lazy` that:
- On a chunk-load failure (`Failed to fetch dynamically imported module`, `Importing a module script failed`, `ChunkLoadError`), sets a one-shot `sessionStorage` flag and calls `window.location.reload()` once — so the stale `index.html` is replaced before the user sees the error card.
- The session flag prevents any reload loop. If the reload also fails, it rethrows and the existing `ErrorBoundary` shows the error (same as today).
- For any non-chunk error, just rethrows. Behavior identical to `React.lazy`.

### 2. One-line change in `src/App.tsx`

Replace the `lazy` import:
```diff
- import { lazy, Suspense } from 'react';
+ import { Suspense } from 'react';
+ import { lazyWithRetry as lazy } from '@/lib/lazyWithRetry';
```

All ~70 existing `lazy(() => import(...))` lines stay exactly the same.

## What is NOT touched

- `ErrorBoundary.tsx` — unchanged
- `versionCheck.ts` — unchanged
- `AuthContext.tsx`, `ProtectedRoute.tsx` — unchanged
- Routing, auth, Supabase, backend — all unchanged

## Why this is safe

- Worst case = exactly today's behavior (brief flash then reload).
- The `sessionStorage` guard cannot cause infinite reloads.
- No new dependencies, no API or schema changes, no edge function work.
