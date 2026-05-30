## What's happening

Your console shows this error on page load:

```
TypeError: Importing a module script failed.
→ ErrorBoundary caught
```

This is a **stale-chunk error after a new deploy**, not a code bug. When we ship a new build, the old browser tab still has the old `index-*.js` shell loaded, but when it tries to lazy-load a step chunk (e.g. Product Images Step 2/3/4/5/6), that file no longer exists at the old hashed URL → the import throws and the ErrorBoundary's "Something went wrong" card flashes.

## Why the existing safety net doesn't catch it

We already have two protections, but there is one gap:

1. `src/lib/lazyWithRetry.ts` — wraps `React.lazy` and silently reloads the page once when a chunk fails to import. Used everywhere in `src/App.tsx` (aliased as `lazy`).
2. `src/lib/versionCheck.ts` — explicitly **skips** the auto-reload on `/app/generate/product-images` (and `/app/catalog`, `/app/video`) to avoid wiping in-progress generations.

**The gap:** `src/pages/ProductImages.tsx` imports `lazy` directly from React (not from `lazyWithRetry`), so its 5 step components are unprotected:

```ts
// src/pages/ProductImages.tsx line 1
import { useState, ..., lazy, Suspense } from 'react';
...
const ProductImagesStep2Scenes = lazy(step2Loader);
const ProductImagesStep3Refine  = lazy(() => import('.../ProductImagesStep3Refine'));
const ProductImagesStep4Review  = lazy(() => import('.../ProductImagesStep4Review'));
const ProductImagesStep5Generating = lazy(() => import('.../ProductImagesStep5Generating'));
const ProductImagesStep6Results = lazy(() => import('.../ProductImagesStep6Results'));
```

When versionCheck runs on this route, it correctly refuses to reload (to protect in-progress work). But then any step transition tries to fetch a stale chunk, throws, and crashes into the ErrorBoundary instead of being silently retried.

## The fix

Swap raw `React.lazy` for `lazyWithRetry` in `src/pages/ProductImages.tsx` — same one-line aliasing pattern already used in `src/App.tsx`.

### Change

`src/pages/ProductImages.tsx`:

1. Remove `lazy` from the React import on line 1.
2. Add `import { lazyWithRetry as lazy } from '@/lib/lazyWithRetry';` near the top.
3. Lines 39–43 keep using `lazy(...)` unchanged (now resolves to the retry version).

## Behavior after fix

- Fresh session, new deploy → step chunk fails → `lazyWithRetry` does one silent `window.location.reload()` → user lands on the new build seamlessly.
- The reload is a **one-shot** (`sessionStorage` flag), so no risk of reload loops.
- Non-chunk errors still rethrow normally and reach the ErrorBoundary as expected.
- No change to the Product Images flow, state, or generation logic.

## What I am NOT changing

- versionCheck's skip-list (keeps protecting in-progress generations from preemptive reloads).
- The ErrorBoundary itself.
- Any other file — quick grep confirms `App.tsx` and `ProductImages.tsx` are the only places using `React.lazy`.

## Risk

Very low. This is the same proven pattern already running in `App.tsx` across ~50 routes.
