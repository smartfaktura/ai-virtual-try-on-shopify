## Goal

Stop the visible flash after almost every click inside `/app`. Verified root cause: the inner `<Suspense fallback={<AppShellLoading />}>` at `src/App.tsx:241` unmounts the current page and renders a skeleton grid while the next lazy route chunk downloads. The outer `BrandLoaderProgressGlyph fullScreen` at `src/App.tsx:158` is only used for top-level public routes and is not the in-app flash.

Secondary contributor: `ScrollToTop` runs `scrollTo(0,0)` at mount + rAF + 80ms + 250ms + a 600ms `MutationObserver`, amplifying the "page jumped" feeling on every nav.

Not contributors (verified, leave alone):
- `checkAppVersion` runs once on mount and skips catalog/product-images/video.
- `ProtectedRoute` uses a `sessionStorage` cache and only shows a loader on first navigation per session.
- Lovable preview iframe HMR — only re-mounts on file edits, not on clicks.

## Changes

### 1. Replace the in-app Suspense fallback (`src/App.tsx:241`)

Today:
```tsx
<Suspense fallback={<AppShellLoading />}>
  <Routes> {/* all /app/* routes */} </Routes>
</Suspense>
```

Switch to `fallback={null}`. Combined with React Router 6's behavior, the previous page stays mounted until the new chunk resolves — no skeleton flash for cached chunks, and only a brief blank for uncached ones (mitigated by #3).

Keep the outer `BrandLoaderProgressGlyph fullScreen` (App.tsx:158) untouched — it's only used for first-time public page loads, which is the right moment for a full loader.

### 2. Soften `ScrollToTop` (`src/components/ScrollToTop.tsx`)

Drop the rAF + 80ms + 250ms + 600ms `MutationObserver` cascade. Replace with a single `window.scrollTo(0, 0)` on pathname change. Keep the page-view tracking and the `POP`/hash early-exits. The cascade existed to fight late-mounting lazy routes — once #1 lands the page no longer remounts, so the cascade has no purpose.

### 3. Eager-prefetch top app chunks on idle (`src/components/app/AppShell.tsx`)

`AppShell` already defines `prefetchMap` (line 29) but only triggers on hover. Add a `useEffect` that on mount calls `requestIdleCallback` (with `setTimeout` fallback) and warms the 6 most-used routes: Dashboard, Visual Studio (Workflows), Freestyle, Library (Jobs), VideoHub, Discover. This makes every sidebar click resolve from cache — instant, no fallback render at all.

### 4. Optional polish: in-app top progress bar

If after #1 there is any noticeable blank on slow connections for uncached chunks, add a 2px fixed top progress bar driven by a `useNavigation`-like delayed indicator (only shows after 200 ms). Skip for now unless QA still shows a flash post-#1.

## Files touched

- `src/App.tsx` — one-line fallback change at L241
- `src/components/ScrollToTop.tsx` — simplify effect body
- `src/components/app/AppShell.tsx` — add idle-prefetch effect using existing `prefetchMap`

## Out of scope

- Removing code splitting (would inflate initial bundle).
- Touching backend, RLS, billing, generation pipelines, or any wizard state.
- Changing `BrandLoaderProgressGlyph` itself.
- Any change to `checkAppVersion`, `ProtectedRoute`, or auth flow.

## Risk

Low. All edits are presentation/perf only. The biggest functional change is `fallback={null}` — React 18 + react-router-dom 6 handles this correctly (previous route stays mounted during chunk fetch); this is the same pattern used by AppShell's own `<Suspense fallback={null}>` wrappers at lines 527 and 530.

Safe to approve.