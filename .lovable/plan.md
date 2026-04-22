

## Simplify "All scenes" ordering: just use `sort_order` + admin star button

You're right — the current logic is too clever. It mixes admin picks + sub-family round-robin + family round-robin and ends up looking random. Let's strip it back to something predictable.

### The new mental model

**One signal controls order: `sort_order` on `product_image_scenes`.**
- Lower number = shown earlier.
- Admins control it from one place: **a star button on each scene card** in `/app/admin/recommended-scenes`.
- Star a scene → its `sort_order` becomes a small negative number (e.g. `-1000 + position`) so it floats to the top of its family/sub-family.
- Unstar → `sort_order` returns to its previous value (saved in a side column or recomputed).

No more `recommended_scenes` join, no more sub-family round-robin, no more 2-by-2 family rotation.

### What the user sees in the Scenes modal (default "All scenes")

Top-down, simple:

```text
For each family in FAMILY_ORDER:
  show that family's scenes ordered by sort_order ASC
  (starred ones come first because they have the smallest sort_order)
```

So opening the modal shows: all Fashion (starred first, then the rest), then all Footwear (starred first), then Bags, then Watches… exactly the order an admin would expect when they look at `/app/admin/recommended-scenes`.

When a user filters by family **Fashion** → same logic inside Fashion: starred sub-families first within each sub-family group. No interleave.

When a user filters by sub-family **Tops & Shirts** → straight `sort_order ASC` (which already puts starred first).

### Admin UX — the new star button

File: `src/pages/AdminRecommendedScenes.tsx`

- Each scene card in the "All scenes" grid gets a small star icon in the top-right corner (filled = featured, outline = not).
- Click star → optimistically update; call a small RPC `toggle_scene_featured(scene_id)` which:
  - If currently `sort_order < 0` → restore previous `sort_order` (stored as `previous_sort_order` int column we add), set `sort_order` back.
  - Else → save current `sort_order` into `previous_sort_order`, set `sort_order = -1000 - row_count_of_already_featured_in_same_collection` so newest featured sits above older featured within the same sub-family.
- The "Featured" sidebar section in the admin page becomes a simple read-only list of scenes where `sort_order < 0`, grouped by `category_collection`, ordered by `sort_order ASC`. Drag-to-reorder still works (updates `sort_order` numerically within the negative range).
- The existing `recommended_scenes` table is no longer needed for ordering. Keep it for now to avoid a destructive migration; just stop reading from it on the user-facing path.

### What gets removed

- `useInterleavedSceneCatalog` two-level interleave + admin-pick join. Replaced with a one-shot fetch ordered by `(category_collection, sort_order)` — which inherently puts starred scenes first per sub-family, then walks through families in `FAMILY_ORDER` client-side.
- `interleaveByFamilyAndSubFamily` helper — no longer used. Keep `interleaveByFamily` (still used by the 12-scene "Recommended for you" rail fallback in `useRecommendedScenes`).
- The client-side sub-family round-robin in `useSceneCatalog` when family filter is active. Just sort by `sort_order ASC` — admin's stars + manual sort_order numbers control everything.

### Files touched

- `src/hooks/useSceneCatalog.ts` — replace `useInterleavedSceneCatalog` body with: one-shot fetch, group by family in `FAMILY_ORDER`, concat. Remove sub-family interleave from `useSceneCatalog`.
- `src/pages/AdminRecommendedScenes.tsx` — add star button on each scene card; wire to new RPC; remove (or hide behind a "Legacy" toggle) the manual recommended_scenes Add/Remove flow.
- `src/lib/sceneTaxonomy.ts` — leave `interleaveByFamily` as-is (still used by recommended rail fallback). `interleaveByFamilyAndSubFamily` can stay unused or be removed in a later cleanup.

### Database

- Add column `previous_sort_order INT NULL` on `product_image_scenes`.
- Add SECURITY DEFINER RPC `toggle_scene_featured(p_scene_id text)` — admin-only via `has_role(auth.uid(), 'admin')`. Returns the new `sort_order`. Atomic.

### Validation

- Open `/app/admin/recommended-scenes` → click star on "Volcanic Sunset" → it jumps to the top of the Beauty section instantly.
- Open Scenes modal in `/app/freestyle` (recommended sort) → "Volcanic Sunset" is one of the first Beauty cards.
- Click family **Beauty** in the sidebar → "Volcanic Sunset" is the first card.
- Click star again on "Volcanic Sunset" → it returns to its original spot in both views.
- Order across the full grid: all Fashion first (starred Fashion at the top of Fashion), then all Footwear, then Bags… in `FAMILY_ORDER`. Predictable, no surprises.
- Sort = **Newest** still pure `created_at DESC` — stars do not pin in this view.

