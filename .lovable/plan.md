## Goal

Add two new perspective options to `/app/perspectives`, appended as the **last** selections:

1. **45° Back-Left** — three-quarter rear view from behind, rotated 45° to model/product's left.
2. **45° Back-Right** — three-quarter rear view from behind, rotated 45° to model/product's right.

These mirror the existing `45° Front-Left` / `45° Front-Right` shots but from the rear hemisphere, so customers can capture back construction with depth (vs. the flat straight-back view).

## Where variations live

The page reads from `workflows.generation_config->variation_strategy->variations` (DB-driven, ID `0417991a-9b16-4537-a035-e24e6f26b1db`, currently 11 entries). The `FALLBACK_VARIATIONS` array in `src/pages/Perspectives.tsx` is only a safety net but is kept in sync for consistency.

Prompt rendering happens in `src/hooks/useGeneratePerspectives.ts` in `getOnModelPhotographyDNA` and `getProductOnlyPhotographyDNA`. Today's `default:` branch derives a `sideNote` from `left/right + 45` keywords — but when `back + left + 45` co-occur it would incorrectly emit the front-left three-quarter description while still appending the back block. Needs a dedicated back-45 branch.

## Changes

### 1. DB migration — append two variations (last positions)

Append to `workflows.generation_config.variation_strategy.variations` for id `0417991a-9b16-4537-a035-e24e6f26b1db`:

```json
{
  "label": "45° Back-Left",
  "category": "angle",
  "instruction": "Three-quarter rear view from the back-left. Camera positioned at 45° behind the product/model on the left side, revealing the full back panel plus the left side construction in a single dimensional shot. Same environment, lighting, and material fidelity as the source. Slightly elevated (15–20° above horizontal) for natural rear hero framing.",
  "referenceUpload": {
    "prompt": "Upload a back or back-left reference of your product for best results (optional)",
    "recommended": true
  }
},
{
  "label": "45° Back-Right",
  "category": "angle",
  "instruction": "Three-quarter rear view from the back-right. Camera positioned at 45° behind the product/model on the right side, revealing the full back panel plus the right side construction in a single dimensional shot. Same environment, lighting, and material fidelity as the source. Slightly elevated (15–20° above horizontal) for natural rear hero framing.",
  "referenceUpload": {
    "prompt": "Upload a back or back-right reference of your product for best results (optional)",
    "recommended": true
  }
}
```

### 2. `src/pages/Perspectives.tsx` — extend `FALLBACK_VARIATIONS`

Append two matching entries at the end (after `hero-low`) with ids `back-left-45` and `back-right-45`, `category: 'angle'`, same instructions as above, and the same `referenceUpload` blocks.

### 3. `src/hooks/useGeneratePerspectives.ts` — back-45 prompt branch

In both `getOnModelPhotographyDNA` and `getProductOnlyPhotographyDNA` (`default:` block), replace the current `sideNote` ternary so back+45 takes priority over front+45:

- If `isBack && l.includes('45') && l.includes('left')` → "Camera positioned at 45° BEHIND the [model/product] on the left side. Both the full back and the left side panel are visible, creating a rear three-quarter view with natural depth. The front is NOT visible."
- If `isBack && l.includes('45') && l.includes('right')` → symmetric right variant.
- Otherwise keep existing front-left/front-right/profile logic.

Also extend the existing `isBack` line so it stays accurate for the new angles (mention that the back panel + chosen side seam are the hero, head may be turned slightly away on model shots).

Keep elevation note (`15–20° above horizontal`) — already triggered by `l.includes('45')`.

### 4. No UI/grid changes

Variations render in their array order, so appending puts them last automatically. Selection cap, reference uploads, and credit math all read from the same array — no extra wiring.

## Out of scope

- Existing 9 variations untouched
- No changes to `useGeneratePerspectives` outside the `sideNote` branches
- No new icons/thumbnails (uses default angle styling)

## Verification

- Open `/app/perspectives`, scroll the variations grid → "45° Back-Left" and "45° Back-Right" appear as the last two options.
- Select one with a model image and one with a product-only image, generate, confirm the rendered prompt logs include the new back-45 sideNote (not the front-left/front-right text).
- Confirm the optional reference upload slot renders for both new options.
