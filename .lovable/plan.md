
# Audit: Product Reference Images → Generation Pipeline Link

## Findings

### 1. Back Image → Works correctly
- **Storage**: `back_image_url` saved to `user_products` from both ManualProductTab and StoreImportTab
- **Auto-fill**: When entering Step 3, `ProductImages.tsx:294` checks `firstProduct.back_image_url` and sets `details.backReferenceUrl`
- **Consumption**: At generation time (line 453), scenes with `backView` trigger block use `details.backReferenceUrl` as `extra_reference_image_url` in the payload
- **Verdict**: End-to-end link is correct

### 2. Packaging Image → Works correctly
- **Storage**: `packaging_image_url` saved correctly
- **Auto-fill**: `ProductImages.tsx:297` sets `details.packagingReferenceUrl`
- **Consumption**: Line 436 passes `packaging_reference_url` in the payload for all scenes
- **Verdict**: End-to-end link is correct

### 3. Side Image → Has a gap
- **Storage**: `side_image_url` saved correctly
- **Auto-fill**: `ProductImages.tsx:304-309` stores it as `sceneExtraRefs['trigger:sideView']`
- **Problem**: `sideView` is NOT registered in `REFERENCE_TRIGGERS` (detailBlockConfig.ts) — only `atomizerDetail`, `openBottle`, `capDetail`, `interiorDetail`, `strapDetail`, `hardwareDetail` exist there. This means:
  1. The generation payload resolver (line 440-446) checks `REFERENCE_TRIGGERS[tb]` — since `sideView` isn't in that map, the `if (refUrl && REFERENCE_TRIGGERS[tb])` check **fails** and the side image is silently dropped
  2. No scenes in the DB have `sideView` as a trigger block, so even if the ref was stored, no scene would look it up
- **Fix needed**: Register `sideView` in `REFERENCE_TRIGGERS` AND add `sideView` to the trigger_blocks of relevant side-angle scenes in the DB

### 4. Query fetches all columns → OK
- `supabase.from('user_products').select('*')` at line 128 returns all columns including the new ones

## Fix Plan

### Step 1: Register `sideView` in `REFERENCE_TRIGGERS` (detailBlockConfig.ts)
Add a new entry:
```ts
sideView: {
  key: 'sideView',
  label: 'Upload side view photo',
  description: 'Upload a side-view photo of your product for accurate profile rendering.',
  promptLabel: 'Side-view reference — use this to accurately render the product profile and side details:',
},
```

### Step 2: Add `sideView` to trigger_blocks of relevant scenes (DB migration)
Update scenes whose titles indicate a side/profile angle (e.g., "Side Profile", "Side View" scenes across categories) to include `'sideView'` in their `trigger_blocks` array. This ensures the side reference image is only injected into scenes that actually need it.

### Step 3: Handle multi-product side refs
Currently auto-fill only uses `firstProduct.side_image_url`. This matches the existing pattern for back/packaging (also first product only), so no change needed — consistent behavior.

## Files to Change
1. `src/components/app/product-images/detailBlockConfig.ts` — add `sideView` to `REFERENCE_TRIGGERS`
2. DB migration — add `'sideView'` to `trigger_blocks` on relevant side-angle scenes

## Scope
- ~10 lines code change
- ~1 SQL migration (UPDATE trigger_blocks for matching scenes)
