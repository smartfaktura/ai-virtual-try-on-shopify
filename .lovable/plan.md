

## Recording works ✅ — fix one more name/thumbnail resolver

### What I checked

- Your freestyle generation at 19:15 UTC is correctly stored: `freestyle_generations.scene_id = "pis-swimwear-editorial-lounger-resort"`.
- Tracking pipeline is healthy.

### One small bug found

When Freestyle uses a **Product Visuals** scene (Scene Catalog modal), it namespaces the ID with a `pis-` prefix (`src/components/app/freestyle/SceneSelectorChip.tsx`, see `PIS_PREFIX` in `src/lib/sceneTaxonomy.ts`). But `/app/admin/scene-performance` only knows about three families:

1. Static `pose_*` / `scene_*` (mockTryOnPoses) ✅
2. `custom-{uuid}` (custom_scenes) ✅
3. Raw `product_image_scenes.scene_id` ✅
4. **`pis-{scene_id}` (Freestyle's namespaced Product Visuals scenes) ❌** — currently shows raw ID + no thumbnail

The DB row exists as `swimwear-editorial-lounger-resort` in `product_image_scenes` ("Sun Lounger Resort Pose" with a thumbnail), but the lookup uses the prefixed string and finds nothing.

### Fix (one file, ~10 lines)

**`src/pages/admin/SceneUsage.tsx`** — same prefix-strip pattern we did for `custom-`:

In `load()`, where `pisIds` is built:
- Detect IDs starting with `pis-`, strip the prefix to get the real `scene_id`.
- Query `product_image_scenes` with the stripped IDs.
- When writing into `metaMap`, re-key with the original `pis-{id}` so the table rows resolve.
- Source badge: still classifies as "Freestyle" (correct — these come from `freestyle_generations`).

After fix, your row renders as **"Sun Lounger Resort Pose"** (Editorial Swimwear) with the proper thumbnail.

### No other changes needed

- No DB / edge function / migration changes.
- KPIs already accurate.
- Top risers rail picks up the fix automatically (shares the same `meta` map).

### Validation

1. Reload `/app/admin/scene-performance` → your `pis-swimwear-editorial-lounger-resort` row shows real name + thumbnail.
2. All other Freestyle Product-Visuals scenes (any `pis-*` ID) resolve too.
3. Existing `pose_*`, `scene_*`, `custom-*`, and raw scene rows still work.

