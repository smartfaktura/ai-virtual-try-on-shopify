# Fix: old SEO image flashes for ~1s before new admin override appears

## What's actually happening

When a visitor opens `/ai-product-photography` (or any page using slot overrides), the page renders **before** the override fetch finishes. The render order is:

1. Component mounts → `useSeoVisualOverridesMap()` returns an empty `Map` (React Query is still loading, `data` is `undefined`).
2. `resolveSlotImageUrl` falls through to the hardcoded fallback URL → browser starts loading the OLD image.
3. ~200–800ms later the Supabase query resolves → component re-renders with the new override URL → browser swaps to the NEW image.

That swap is the "flash of old image" the user is seeing. It happens on every fresh page load and after every navigation that remounts the page, because the override data lives only in React Query's in-memory cache and starts cold.

Two smaller compounding issues:
- The `Map` in `useSeoVisualOverridesMap` is rebuilt on every render (no `useMemo`).
- Existing overrides are never preloaded, so even repeat visitors pay the round-trip on the first paint of the session.

## Fix strategy

Eliminate the flash by ensuring the resolver **never returns the old fallback URL once an override exists**, and by making the override data available before first paint whenever possible.

### 1. Persist the override map across sessions (localStorage cache)

Add a tiny synchronous cache layer in `useSeoVisualOverrides.ts`:

- On module load, hydrate React Query's cache from `localStorage` key `seo-visual-overrides:v1` (a JSON snapshot of the last fetched rows + a timestamp).
- After every successful fetch, write the fresh snapshot back to `localStorage`.
- The hook initializes `useQuery` with `initialData` built from this snapshot, so on repeat visits the map is populated **synchronously on first render** — no flash, no waiting.

This is safe: the snapshot is public data already shipped to every visitor, and a stale snapshot can't render anything worse than the fallback (which is what happens today anyway).

### 2. Gate the fallback while the very first fetch is in flight (cold cache only)

For the first-ever visit (no localStorage snapshot yet), expose an `isLoading` flag from `useSeoVisualOverridesMap`:

```ts
return { map, isReady };  // isReady = !isLoading || hasSnapshot
```

In each consumer (`LandingHeroSEO`, `LandingOneToManyShowcase`, `LandingCategoryGrid`, `PhotographyCategoryChooser`, `PhotographyVisualSystem`, `PhotographySceneExamples`, `CategoryBuiltForEveryCategory`, `CategoryRelatedCategories`, plus the per-category hero/scene resolvers), gate the `<img src>` so we render a transparent placeholder (or `loading="eager"` empty src) until `isReady === true`. That removes the wrong-image network request entirely on cold cache.

The placeholder will be visible for at most one network round-trip (~200ms) instead of showing the wrong image for ~1s — and only on the very first visit per browser. Every subsequent visit hits the localStorage cache and renders correctly on the first paint.

### 3. Preload the override images so the swap (if any) is instant

When the override map resolves, kick off `new Image().src = override.preview_image_url` for every visible slot on the current page. This makes the browser fetch & decode the override image in parallel, so even on a cold cache the placeholder → final-image transition is sub-100ms instead of waiting for a fresh network fetch.

### 4. Memoize the map

Wrap the `Map` construction in `useMemo(() => …, [data])` so consumers that depend on it don't rebuild on every render.

### 5. Keep admin invalidation working

`useAdminSeoVisuals` already calls `invalidateQueries(SEO_OVERRIDES_QUERY_KEY)` after upsert/delete. That stays. We additionally clear and rewrite the localStorage snapshot inside the same `onSuccess` so admins testing in the same browser see the change on next page load instantly.

## Files to change

- `src/hooks/useSeoVisualOverrides.ts` — add localStorage snapshot + `initialData` + memoized map + `isReady` flag + image preload effect.
- `src/hooks/useAdminSeoVisuals.ts` — write fresh snapshot to localStorage in `onSuccess`.
- `src/lib/resolveSlotImage.ts` — add a `resolveSlotImage(overrides, isReady, route, key, fallback)` variant that returns `null` when `!isReady && noSnapshot`, used by consumers to render the placeholder.
- Consumer components (gate `<img>` with placeholder until `isReady`):
  - `src/components/seo/landing/LandingHeroSEO.tsx`
  - `src/components/seo/landing/LandingOneToManyShowcase.tsx`
  - `src/components/seo/landing/LandingCategoryGrid.tsx`
  - `src/components/seo/photography/PhotographyCategoryChooser.tsx`
  - `src/components/seo/photography/PhotographyVisualSystem.tsx`
  - `src/components/seo/photography/PhotographySceneExamples.tsx`
  - `src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx`
  - `src/components/seo/photography/category/CategoryRelatedCategories.tsx`
  - `src/pages/seo/AIProductPhotographyCategory.tsx` (hero + collage + scene-example resolvers)

## Result

- **Repeat visitors / admins testing edits:** the new image appears on the very first paint. No flash, ever.
- **First-time visitors (cold cache):** a neutral placeholder for ~200ms, then the correct image. Never the wrong image.
- **SEO crawlers:** unchanged — they get the `<img alt>` and proper URLs once the data resolves; no layout shift because placeholder reserves the same aspect-ratio box.
