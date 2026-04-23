

## Safety review of the unified-scenes plan

Short answer: **the plan is safe in principle, but as written it has 3 risks that need mitigation before we ship.** Here is what's safe, what's risky, and the adjusted plan.

### What's safe ✅

- **Adding `scene_ref` column to `discover_presets`** — additive, nullable, no impact on existing reads.
- **New `useAllScenes()` hook** — reads from `product_image_scenes`, which already powers Step 2. Same RLS, same data, no new attack surface.
- **Resolver priority `?sceneRef` first, legacy fallback second** — pure addition, doesn't break old Discover items, old shareable URLs, or in-flight wizard sessions.
- **Admin Discover form picker writing `scene_ref`** — admin-only, behind existing `has_role('admin')` RLS.

### Risks that must be mitigated ⚠️

**Risk 1 — `EditMetadataModal` and `ImageEditModal` swap data sources**
These modals today read from `custom_scenes` (Discover-curated subset). The plan swaps them to the full `product_image_scenes` library (1500+ rows vs ~200). Two concrete dangers:
- Any saved metadata that referenced a `custom_scenes.id` (uuid) won't resolve in the new picker (which keys by `scene_id` text). Users could see "Scene: unknown" on existing assets.
- If the Edit Image "Browse scenes" modal **applies** the picked scene's `prompt_template` to re-edit the image, swapping to `product_image_scenes` changes the prompt domain — some templates require product references the modal doesn't supply.

  → **Mitigation:** before swapping, audit what each modal **does** with the picked scene (display-only label vs. drives a prompt). If it drives a prompt, keep the modal on its current source for now and only unify the **picker UI** in a separate follow-up. If it's display-only, swap is safe.

**Risk 2 — Backfill ambiguity for `discover_presets.scene_ref`**
The plan says "unambiguous matches only." For ambiguous titles (Frozen Aura ×9), `scene_ref` stays NULL → those Discover items fall back to legacy resolver → **same wrong-variant bug as today** until admin manually fixes each one.
  → **Mitigation:** for ambiguous titles, also auto-match using `discover_presets.category` → `product_image_scenes.category_collection` mapping (we already maintain a category map in the codebase). Only leave NULL when even that doesn't disambiguate. Surface NULL rows in the admin Discover list with a "Needs scene link" badge.

**Risk 3 — Live Discover items currently using `?sceneImage` URL matching**
A few legacy resolver paths in `ProductImages.tsx` match by image URL substring. If we don't carefully order the priority chain, `?sceneRef` lookup failures could fall through to image matching and pick the wrong row again.
  → **Mitigation:** when `?sceneRef` is present but doesn't resolve to an active scene, **stop**. Show a soft toast ("This Explore scene is no longer available"), don't fall back to URL/title guessing. This is safer than silently picking a wrong scene.

### Out-of-scope risks (no impact)

- Freestyle, presets-library, prompt-only Discover items, Add-to-Discover modal, Catalog Studio, Brand Models, Short Film, Creative Drops, generation queue, RLS on any table, edge functions, Stripe / billing, credit math.

### Adjusted, safer plan

Same as before, with these changes:

1. **Phase the modal swap.** Phase 1 ships only: DB column + backfill + Discover handoff + Wizard resolver + admin Discover picker. Phase 2 (separate PR) tackles `EditMetadataModal` / `ImageEditModal` after a per-modal audit.
2. **Smarter backfill.** Use both title and category mapping; flag remaining NULLs in admin UI.
3. **Hard stop on `?sceneRef` miss.** No silent fallback to title/image matching. Toast + leave wizard in normal Step 2 state.
4. **Keep legacy resolver** untouched for Discover items without `scene_ref` (no regression for old links).

### Files (unchanged from previous plan, minus the modal edits in Phase 1)

```text
DB migration   ALTER TABLE discover_presets ADD COLUMN scene_ref text + index
DB data fix    Backfill scene_ref by title + category mapping
NEW            src/hooks/useAllScenes.ts
EDIT           src/pages/Discover.tsx              (handoff via ?sceneRef)
EDIT           src/components/app/DiscoverDetailModal.tsx
EDIT           src/pages/ProductImages.tsx         (resolver: sceneRef first, hard stop on miss)
EDIT           src/pages/admin/Discover*.tsx       (scene picker writes scene_ref)

DEFERRED to Phase 2 (after audit):
   src/components/app/library/EditMetadataModal.tsx
   src/components/app/library/ImageEditModal.tsx
```

### Validation gates before merging Phase 1

1. Old Discover items without `scene_ref` still recreate exactly as today.
2. New `?sceneRef` items land on the correct scene row regardless of product category.
3. Admin can see and fix any "Needs scene link" rows.
4. No change to Library, Edit Metadata, Edit Image, Freestyle, or any generation pipeline.

