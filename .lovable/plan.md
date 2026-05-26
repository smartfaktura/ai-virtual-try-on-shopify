## What you're seeing

Every clickable link in the app/site navigates to a route that is code-split with `React.lazy(() => import(...))` in `src/App.tsx`. When you click a link:

1. React unmounts the current page.
2. The lazy chunk for the new page starts downloading.
3. The `<Suspense fallback={<BrandLoaderProgressGlyph fullScreen />}>` boundary shows a full-screen loader for that brief moment.
4. Chunk arrives (usually <300ms), new page renders.

That brief full-screen loader is the "flash" — it's not an error, not a reload, not caused by `lazyWithRetry` or `versionCheck`. It is the normal Suspense fallback for code splitting, and `fullScreen` makes it very visible because it paints over the whole viewport.

`checkAppVersion()` runs once on app mount and is gated by `sessionStorage`, so it isn't reloading on navigation. `lazyWithRetry` only reloads on a real chunk-load error, which isn't happening here.

## Fix (small, safe, presentation-only)

Two tiny changes, no logic / auth / backend touched.

### 1. Delay the Suspense fallback so fast loads don't flash

Wrap the fallback so it only appears after ~200ms. Most chunk loads finish faster than that, so the loader never renders and there is no flash. Slow loads still show the loader normally.

In `src/App.tsx`:
```diff
- <Suspense fallback={<BrandLoaderProgressGlyph fullScreen />}>
+ <Suspense fallback={<DelayedFallback />}>
```

Add a tiny inline component in the same file:
```tsx
function DelayedFallback() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, []);
  return show ? <BrandLoaderProgressGlyph fullScreen /> : null;
}
```

### 2. Prefetch route chunks on link hover (in-app sidebar/nav)

The landing nav already does this. Apply the same pattern in the authenticated app nav so hovering a sidebar link warms its chunk before the click.

- Identify the file that renders the app sidebar links (e.g. inside `src/components/app/`).
- For each `<Link to="/app/...">`, add `onMouseEnter`/`onFocus` that calls the matching `() => import('@/pages/...')`.
- No behavior change, just a network hint — purely additive.

If the app sidebar is large, do the prefetch wiring only for the most-clicked links first (Dashboard, Workflows, Products, Discover, Video Hub, Library).

## What is NOT changed

- `lazyWithRetry.ts` — unchanged
- `versionCheck.ts` — unchanged
- `ErrorBoundary.tsx` — unchanged
- `AuthContext`, `ProtectedRoute`, routing, Supabase, edge functions — unchanged
- The loader component itself — unchanged (just shown later)

## Why this is safe

- Worst case the 200ms delay does nothing and you see today's behavior.
- Prefetch on hover is a no-op if the chunk is already cached.
- No new dependencies. No schema or API work.
