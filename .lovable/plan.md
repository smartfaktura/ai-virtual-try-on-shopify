## Problem

Visiting `/discover/scene-rec-amber-glow-studio-5` directly is slow because the modal can't open until the **entire** discover feed has loaded:

1. `useDiscoverPresets()` (all presets)
2. `get_public_custom_scenes` RPC (all custom scenes)
3. `get_public_recommended_scenes` RPC (all 400+ admin-curated scenes)
4. `useHiddenScenes` filter
5. Then `allItems.find(...)` runs and finally `setSelectedItem(found)` opens the modal
6. Only **then** does the hero `<img>` start downloading

Result: ~400+ JSON rows + the grid's thumbnail image requests all compete with the one image the user actually came to see.

## Fix — 3 layers, all surgical

### 1. Fast-path the deep-linked item (biggest win)

In `src/pages/PublicDiscover.tsx`, add a dedicated query that runs **immediately** when `urlItemId` is present, independent of the feed:

- If `urlItemId` starts with `scene-rec-` → query a single row from the recommended-scenes source by `scene_id` (strip the `scene-rec-` prefix). Reuse the existing RPC return shape; either:
  - add a tiny new RPC `get_public_recommended_scene_by_id(scene_id text)`, or
  - do a direct `from('product_image_scenes').select(...).eq('scene_id', id).maybeSingle()` if RLS allows public read (verify first; fall back to RPC if not).
- If `urlItemId` starts with `scene-custom-` → single-row fetch from `custom_scenes` by id.
- If `urlItemId` starts with `scene-` (legacy mock pose) → resolve from local `mockTryOnPoses` synchronously (already in bundle, zero network).
- Otherwise (preset slug/UUID) → single-row `from('discover_presets').select('*').or('slug.eq.X,id.eq.X').maybeSingle()`.

Map the row through the same `toTryOnPose` / preset shape used today, wrap as a `DiscoverItem`, and `setSelectedItem(found)` as soon as it resolves. The modal opens in **one round-trip** instead of three + filter pass.

### 2. Preload the hero image

As soon as the single-item query resolves, inject a `<link rel="preload" as="image" href={getOptimizedUrl(previewUrl, { quality: 75 })} fetchpriority="high">` into `document.head` (cleaned up on unmount). This kicks off the image download in parallel with React rendering the modal, shaving another ~200–500 ms on cold loads.

### 3. Defer the feed when deep-linked

Currently the feed queries fire on mount regardless. Gate them so when `urlItemId` is present:

- `useDiscoverPresets`, `get_public_custom_scenes`, `useRecommendedDiscoverItems` all run with a small `setTimeout` / `requestIdleCallback` delay (e.g. 400 ms after the modal hero image's `onLoad`), OR keep them eager but lower their priority by passing `staleTime` only — the key change is the **modal no longer waits on them**.

The existing "auto-open from URL" effect (lines 184–198) becomes a no-op when the fast-path already set `selectedItem`. Keep it as a fallback so non-fast-path URLs (or stale fast-path failures) still work once the feed loads.

### 4. Modal hero — instant low-quality placeholder

In `src/components/app/DiscoverDetailModal.tsx` (lines 203–218), mirror the pattern already used in `SceneDetailModal.tsx`:

- Render a `quality: 20` placeholder `<img>` first (blurred, scaled), then crossfade to the `quality: 75` full image on `onLoad`.
- Keep the existing `ShimmerImage` skeleton underneath for the brief moment before either image paints.

This gives a perceived-instant hero even on slow connections.

## Files touched

- `src/pages/PublicDiscover.tsx` — add `useDeepLinkedDiscoverItem(urlItemId)` query, set `selectedItem` from it, defer/relax feed dependency for modal opening.
- `src/components/app/DiscoverDetailModal.tsx` — add LQIP placeholder + crossfade in the left hero panel; add `<link rel="preload">` effect for the hero URL.
- (Optional) `supabase/migrations/*` — add `get_public_recommended_scene_by_id(text)` RPC if direct table read isn't permitted by RLS for anon. Verify first with `supabase--read_query` before adding.

## What does NOT change

- Grid rendering, filters, taxonomy, related-items panel, save/featured/admin controls — all untouched.
- No changes to RLS unless the single-row read requires it (will verify and report before adding a migration).
- No changes to routing, sitemap, or prerender pipeline.
- No new dependencies.

## Expected result

Cold load of `/discover/scene-rec-amber-glow-studio-5`:

- Today: ~3 RPC calls + filter + image download serially → modal hero visible after ~1.5–3 s.
- After: 1 RPC call (single row) + parallel image preload → modal hero visible in **~300–600 ms**, with the rest of the feed populating quietly behind the modal.

## Validation plan

1. Hard-refresh `/discover/scene-rec-amber-glow-studio-5` → modal opens with hero image before the masonry grid finishes loading.
2. Hard-refresh a preset URL like `/discover/<slug>` → same fast behavior.
3. Hard-refresh `/discover` (no item) → unchanged behavior, no extra round-trips.
4. Open an item by clicking a card from the grid → unchanged (uses in-memory item, no extra fetch).
5. Network tab: confirm the hero image request starts within the first ~200 ms of navigation.

Approve and I'll implement.
