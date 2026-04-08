

# Bags Category: Reference Triggers + New Scenes

## Summary
Create dedicated reference trigger definitions for bags (like fragrance has `atomizerDetail`, `openBottle`, `capDetail`), rename one scene, and add 3 new scenes. The reference triggers will show dedicated upload cards in the Setup step with bag-specific instructions.

## Changes

### 1. New Reference Triggers in `detailBlockConfig.ts`

Add 3 new bag-specific reference triggers to the `REFERENCE_TRIGGERS` map:

| Trigger Key | Label | Description | Prompt Label |
|-------------|-------|-------------|--------------|
| `interiorDetail` | Upload interior photo | Upload a photo showing the inside of your bag — lining, pockets, compartments — so the AI can accurately render the interior layout and color. | Bag interior reference — use this to accurately render the lining, pockets, and internal layout: |
| `strapDetail` | Upload strap close-up | Upload a close-up of the strap showing hardware attachment, stitching, and adjustability so the AI can render it accurately. | Strap/handle close-up reference — use this to accurately render strap construction and hardware attachment: |
| `hardwareDetail` | Upload hardware close-up | Upload a close-up of the bag's metal hardware — zippers, clasps, buckles, rings — for accurate rendering. | Hardware close-up reference — use this to accurately render metal details, clasps, and zipper pulls: |

### 2. Database Updates (via insert tool)

**Rename**: `hardware-macro-bags` title → "Hardware Close-Up"

**Update `interior-view-bags`**: Add `interiorDetail` to its `trigger_blocks` array. This makes the interior reference upload card appear automatically when this scene is selected.

**Update `hardware-macro-bags`**: Add `hardwareDetail` to its `trigger_blocks` array. Same pattern — hardware close-up reference appears when selected.

**Insert 3 new scenes** into `bags-accessories` / `Essential Shots`:

| Scene ID | Title | Type | Triggers | Sort |
|----------|-------|------|----------|------|
| `strap-detail-bags` | Strap Detail | macro | `{background,strapDetail}` | 19 |
| `arm-cradle-hold-bags` | Arm Cradle Hold | portrait | `{background,personDetails}` | 20 |
| `hanging-strap-bags` | Hanging Strap | packshot | `{background}` | 21 |

The `strap-detail-bags` scene includes `strapDetail` trigger so the strap reference upload card appears when selected.

### 3. No other frontend changes needed
The existing `REFERENCE_TRIGGERS` rendering loop in `ProductImagesStep3Refine.tsx` already handles any key present in the map — it shows the upload card with label/description, handles upload to `product-uploads` bucket, and passes the reference URL + prompt label through to the generation pipeline via `ProductImages.tsx`.

## How it works end-to-end
1. User selects "Interior View" → `interiorDetail` trigger detected → Setup step shows "Upload interior photo" card
2. User uploads interior photo → stored as `sceneExtraRefs['trigger:interiorDetail']`
3. At generation time, the reference image URL + prompt label ("Bag interior reference — use this to...") are injected alongside the product image
4. Same flow for Strap Detail (strapDetail) and Hardware Close-Up (hardwareDetail)

