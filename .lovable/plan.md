

## Make Discover handoff workflow-aware

You're right — we don't need to merge libraries. We just need Discover to read the **right** scene library based on the **workflow** the item belongs to.

### The simple rule

| Discover item's `workflow_slug` | Scene picker source | URL param |
|---|---|---|
| `product-images` (or null/legacy "create product visuals") | `product_image_scenes` | `?sceneRef=<scene_id>` |
| `freestyle` / any other workflow | `custom_scenes` | `?sceneId=<custom_scenes.id>` (existing) |

That's it. No library merge, no migration of `custom_scenes`, no Phase 2 modal swap.

### What Phase 1 already shipped (keep as-is)

- `discover_presets.scene_ref` column ✅
- Backfill for product-images items ✅
- `?sceneRef` resolver in `ProductImages.tsx` with hard-stop on miss ✅
- `Discover.tsx` + `DiscoverDetailModal.tsx` send `?sceneRef` when set ✅

### What still needs fixing

1. **Admin Discover form — workflow-aware scene picker**
   `src/pages/admin/Discover*.tsx` (create + edit forms):
   - When admin picks `workflow_slug = product-images` → Scene picker reads `product_image_scenes` (full 1500+ catalog, grouped by `category_collection` → `sub_category`), writes `scene_ref`.
   - When admin picks any other workflow (`freestyle`, etc.) → Scene picker reads `custom_scenes`, writes `scene_name` only (legacy behavior, `scene_ref` stays null).
   - Switching workflow clears the previously picked scene.

2. **"Needs scene link" admin badge**
   In the admin Discover list, flag rows where `workflow_slug = product-images` AND `scene_ref IS NULL`. One-click inline picker fixes them. (Other workflows are exempt — they don't need `scene_ref`.)

3. **Verify Discover handoff is workflow-aware**
   `Discover.tsx handleUseItem` and `DiscoverDetailModal.tsx` Recreate CTA:
   - If `workflow_slug = product-images` → route to `/app/generate/product-images?sceneRef=…`
   - If `workflow_slug = freestyle` → route to `/app/freestyle?…` with the existing freestyle params (no change)
   - Other workflows → existing routing unchanged

### Files to change

```text
EDIT  src/pages/admin/Discover*.tsx (create + edit forms)
        - Workflow-aware scene picker (two sources, switched by workflow_slug)
        - "Needs scene link" badge on the admin list

EDIT  src/pages/Discover.tsx
        - Confirm routing branches on workflow_slug; no fallthrough into wrong wizard

EDIT  src/components/app/DiscoverDetailModal.tsx
        - Same routing audit on Recreate CTA

NO CHANGE
  - product_image_scenes / custom_scenes tables
  - Wizard Step 2 (already correct)
  - Freestyle scene picker (already correct, uses custom_scenes)
  - EditMetadataModal / ImageEditModal (don't exist here — Phase 2 cancelled)
  - RLS, generation pipeline, prompt engine
```

### Validation

1. Admin creates a Discover item with `workflow_slug = product-images` → picker shows `product_image_scenes`, saved row has `scene_ref` populated.
2. Admin creates a Discover item with `workflow_slug = freestyle` → picker shows `custom_scenes`, saved row has `scene_name` only.
3. User taps a product-images Discover item → wizard pre-ticks correct scene by `scene_ref`.
4. User taps a freestyle Discover item → freestyle opens with the existing custom_scenes scene (unchanged).
5. Admin list shows "Needs scene link" only on product-images rows missing `scene_ref`.

### Out of scope

- Touching `custom_scenes` data, Freestyle picker, Library, generation pipeline, RLS.
- Any further unification — confirmed not needed.

