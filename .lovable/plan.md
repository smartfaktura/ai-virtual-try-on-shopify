

## Fix: Add to Discover loses the original `scene_id` from Product Visuals jobs

### Root cause

When you generated the wallet on aloe leaves via Product Visuals, the wizard knew the exact scene ref (`botanical-oasis-10`). But by the time you opened **Add to Discover** from the Library, that ref was lost — so the modal shows "No scene detected" and tries to AI-guess instead.

There are **three breaks in the chain**, all small:

1. **Wizard → DB**: `src/pages/ProductImages.tsx` line 886 sends `scene_id: scene.id` in the payload, and `generate-workflow` line 988 reads it. But a quick DB check shows `generation_jobs.scene_id` is null on every recent product-images job, while `scene_name` is populated. Need to verify the field actually lands (likely a payload nesting issue — the snapshot at line 1078 reads `b.scene_id` but the wizard payload is correct, so something between is dropping it). Worst case: add a defensive log and re-confirm the field name.

2. **DB → Library hook**: `src/hooks/useLibraryItems.ts` line 89 reads `scene_name` and `scene_image_url` but never reads `scene_id`. The library item it builds has no `sceneId`, so downstream consumers can't get a stable ref.

3. **Library → Modal**: `src/components/app/LibraryDetailModal.tsx` line 524-540 passes `sceneName`/`modelName` but no `sceneId`. The modal accepts `sceneId` (line 41) but only uses it for mock-pose lookup — never as the authoritative `scene_ref` to write back to `discover_presets`.

### Fix — three small touches

#### 1. `src/pages/ProductImages.tsx`

Verify `scene_id` is actually being persisted on new jobs. If the recent jobs (yesterday) really don't have it, dig one level deeper — either the wizard was deployed after those jobs, or the queue worker is dropping it. Add a `console.log('[wizard] enqueue scene_id', payload.scene_id)` before the enqueue call, generate one image, then re-query. If the field is reaching the edge function but not landing in DB, fix the snapshot field at `generate-workflow/index.ts` line 1078.

#### 2. `src/hooks/useLibraryItems.ts` (line 75-97)

Add `scene_id` to the select and to the item:
```ts
sceneId: job.scene_id || undefined,
```
Also extend the LibraryItem type to carry `sceneId?: string`.

Update the `select` clause at the top of the query (find the columns list — likely a few lines above) to include `scene_id`.

#### 3. `src/components/app/LibraryDetailModal.tsx` (line 524-540) and `src/components/app/AddToDiscoverModal.tsx`

- **LibraryDetailModal**: pass `sceneId={activeItem.sceneId}` into both `AddToDiscoverModal` and `SubmitToDiscoverModal`.
- **AddToDiscoverModal**: 
  - In the existing `(async () => {...})()` block at line 188, when `sourceGenerationId` lookup runs, also pull `scene_id` and store it as `resolvedSceneRef` (new local).
  - When `sceneId` prop is a real `product_image_scenes.scene_id` (not a mock id), skip mock matching and treat it as the authoritative `scene_ref`.
  - At line 351, change `sceneRefToWrite` so it prefers (in order): the prop/DB-resolved authoritative `scene_ref` → `pickedScene?.sceneRef`. This way, even if title-matching fails (because all 11 "Botanical Oasis" rows share the same title), we write the exact original ref — not a sibling.

This makes the Add to Discover modal **deterministic** for any Product Visuals library item: the wallet-on-aloe asset publishes with `scene_ref = "botanical-oasis-10"` automatically — no AI guessing, no title collision.

### Behaviour after fix

- Open the wallet-on-aloe Library item → click Add to Discover → modal opens with Workflow=Product Visuals, Scene=**Botanical Oasis** (auto-picked from the original `scene_id`), red "No scene detected" warning gone.
- Publish → `discover_presets.scene_ref = "botanical-oasis-10"` written exactly as the wizard used it.
- Click Recreate from Explore → wizard pre-selects the exact same scene (with the soft-fallback we just shipped, even if the user opens it for a different product category).

### Out of scope
- No DB migration or de-duplication of "Botanical Oasis" rows.
- No changes to mock-pose handling or Freestyle (`custom_scenes`) paths.
- No layout, copy, or memory changes.

### Files touched
```text
EDIT  src/hooks/useLibraryItems.ts          — add scene_id to select + item
EDIT  src/components/app/LibraryDetailModal.tsx — forward sceneId prop
EDIT  src/components/app/AddToDiscoverModal.tsx — use sceneId/scene_id as authoritative scene_ref
VERIFY src/pages/ProductImages.tsx           — confirm scene_id reaches DB; fix payload key if not
```

