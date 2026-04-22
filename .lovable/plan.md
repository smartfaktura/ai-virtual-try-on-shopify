

## Fix: scene reordering not reflecting until hard refresh

### Root cause
`handleMove` and `handleMoveToTop` issue 2-N parallel `updateScene.mutateAsync` calls via `Promise.all`. Each mutation's `onSuccess` (in `useProductImageScenes`) calls `invalidateAll()`. React Query coalesces invalidations and triggers a refetch the moment the **first** mutation resolves — that refetch reads the DB before the remaining parallel writes have committed, so the cache is repopulated with stale `sort_order` values. The page then shows the old order until you hard-refresh (which forces a fresh fetch after all writes have settled).

### Fix (single file: `src/pages/AdminProductImageScenes.tsx`)

**1. Bypass the per-mutation invalidation for bulk reorder operations.**  
Inside `handleMove` and `handleMoveToTop`, replace the `updateScene.mutateAsync(...)` calls with direct `supabase.from('product_image_scenes').update({ sort_order }).eq('id', s.id)` calls collected in a single `Promise.all`. After all writes resolve, call `queryClient.invalidateQueries` for the three scene query keys exactly once. This guarantees the refetch happens *after* every write is committed.

**2. Optimistic cache update for instant UI feedback.**  
Before awaiting the writes, call `queryClient.setQueryData` on the active query key (`['product-image-scenes', cacheVariant]`) to mutate the in-cache `sort_order` values for the affected scenes. The list re-renders immediately; the subsequent invalidation reconciles with the server.

**3. Same fix applied to `handleMoveSubCategory`** (it uses the same parallel-mutate pattern).

### Why this works
- Single post-write invalidation eliminates the read-before-all-writes race.
- Optimistic update makes the arrow click feel instant (no waiting on the round-trip + refetch).
- `groupBySubCategory` already sorts by `sort_order` ascending, so the reordered cache renders correctly.

### Validation
- `/app/admin/product-image-scenes` → Apparel → Creative Shots → click ↑ on `Urban NYC Street`: order changes immediately, no hard refresh needed.
- Click ⏫ (move-to-top) on `Skatepark Golden Hour`: jumps to position #1 instantly.
- Move sub-category `Creative Shots` up: reorders instantly.
- Refresh the page → server-side order matches what was shown.

### Out of scope
No schema changes, no other handlers, no realtime subscription (overkill for an admin-only page).

