## Problem

`/discover` visibly flashes and reorders items during initial load. Users see one layout, then items reshuffle into different columns 1–2 times within a second.

## Root Cause

`PublicDiscover.tsx` builds the feed from **three independent queries** that each resolve at different times:

1. `useDiscoverPresets()` — main presets (~hundreds of rows)
2. `get_public_custom_scenes` RPC — custom scenes
3. `useRecommendedDiscoverItems({ mode: 'public' })` — recommended scenes

The skeleton (`MasonrySkeletonGrid`) only hides when `isLoading` from **presets** is false. The other two queries are still in flight, so:

- T+200ms: presets arrive → grid renders with presets only, sorted + distributed across 4 columns
- T+400ms: custom scenes arrive → `allItems` rebuilds → `sorted` re-sorts → items get reassigned to different columns (`i % columnCount`) → visible reshuffle
- T+600ms: recommended scenes arrive → another full reshuffle

The column distribution `cols[i % columnCount]` is **index-based**, so inserting any new item near the front of the sorted list shifts every later item to a different column.

## Fix

Treat the feed as "loading" until **all three sources** have resolved at least once. Keep showing the skeleton during that window so the user only ever sees the final, stable order.

## Changes

### `src/pages/PublicDiscover.tsx`

1. Capture `isLoading` (or `isPending`) from all three queries:
   - `useDiscoverPresets()` → already exposed as `isLoading`
   - `useQuery(['public-custom-scenes'])` → destructure `isLoading: isLoadingCustom`
   - `useRecommendedDiscoverItems({ mode: 'public' })` → destructure `isLoading: isLoadingRecommended` (verify hook returns it; if not, add it)

2. Compute `const feedLoading = isLoading || isLoadingCustom || isLoadingRecommended;`

3. Replace the skeleton gate:
   ```tsx
   {feedLoading ? <MasonrySkeletonGrid ... /> : ...}
   ```

4. Keep the deep-link fast-path untouched — the modal still opens instantly on `/discover/scene-rec-*` because it uses `useDeepLinkedDiscoverItem` and renders independently of the grid.

### `src/hooks/useRecommendedDiscoverItems.ts` (only if needed)

Confirm the hook returns `isLoading` from `useQuery`. If it currently returns only `data`, expose `isLoading` as well so the page can wait on it.

## Why this is safe

- All three queries have `staleTime: 10 * 60 * 1000`, so subsequent visits hit the cache and `isLoading` is false immediately — no extra skeleton time for warm loads.
- Cold loads currently flash twice within ~400–600ms; the user instead sees the skeleton for that same window and then the final layout, which feels faster and more polished.
- No data-shape or sorting logic changes — only the gating of first paint.

## Out of scope

- Server-side merging of the three sources (would be nicer long-term but is a bigger refactor).
- Switching from index-based column distribution to height-balanced masonry (separate concern).
