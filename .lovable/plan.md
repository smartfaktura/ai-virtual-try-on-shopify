## Rounding audit — `/app/generate/product-images`

Current usage across the wizard files (252 hits):

```
rounded-full   116   pills, chips, avatars, circle thumbs        ✓ correct
rounded-xl      50   cards, panels, modals                       ✓ canonical "container"
rounded-lg      58   mixed: panels, banners, tiles, dropzones    ✗ inconsistent
rounded-md      23   small chips, toggles, mini thumbs           ✓ correct for ≤32px
rounded-2xl      3   ColorPickerDialog, Step5Generating card     ⚠ outliers
rounded-3xl      2   BrandModels/BrandScenes info modals         ⚠ outliers
rounded-t        1   one stray                                   ✗ leftover
```

## Proposed scale (single aesthetic)

| Token | Use for |
|---|---|
| `rounded-full` | pills, chip avatars, circular tokens |
| `rounded-md` | tiny interactive bits ≤32px (mini chips, small toggles, 6/7/8/9/10-unit thumbnails) |
| `rounded-xl` | **all** containers: cards, panels, banners, dialog content, hint strips, collapsibles, dropzones, scene/product tiles, image thumbs ≥40px |
| `rounded-2xl` | *removed* — collapse to `rounded-xl` |
| `rounded-3xl` | *removed* — collapse to `rounded-xl` |

This collapses every "container-sized" surface to **one radius** (`xl`), keeps `full` for pills and `md` for sub-32px elements. No new tokens introduced.

## Changes (grouped, ~25 edits)

**A. Collapse `rounded-2xl` / `rounded-3xl` → `rounded-xl`**
- `ProductImagesStep5Generating.tsx` L133 (loader card)
- `ColorPickerDialog.tsx` L220 (dialog content)
- `BrandScenesPromoCard.tsx` L18 (promo card)
- `BrandModelsInfoModal.tsx` L44 (modal)
- `BrandScenesInfoModal.tsx` L39 (modal)

**B. Promote container `rounded-lg` → `rounded-xl`** (panels / banners / dropzones / scene tiles / image thumbs ≥40px)
- `ProductImages.tsx` L1545, L1552, L1615, L1687
- `ProductThumbnail.tsx` L24
- `ProductSpecsCard.tsx` L181, L191
- `ProductImagesStep5Generating.tsx` L224, L245
- `ProductImagesStep3Settings.tsx` L163, L355, L437
- `ProductImagesStep4Review.tsx` L486
- `ProductImagesStep3Refine.tsx` L442, L1434, L1524, L1547, L1820, L2404, L2626, L2651, L2736, L2761, L2783, L2813, L2863, L2906, L3071, L3157, L3179, L3214
- `BrandScenesPromoCard.tsx` L25 (stacked scene previews are 36×44 — container-sized)
- `AiStylistCard.tsx` L50, L52

**C. Keep `rounded-md` (correct as-is)**
- `ProductSpecsCard.tsx` L140, L191(no — already in B), L315
- `OutfitSlotCard.tsx` L42, L110, L154, L176
- `ProductImagesStep3Refine.tsx` L883, L1855, L2438, L2456, L2963

**D. Fix the lone `rounded-t`**
- Located via `rg "rounded-t\b"`; replace with proper `rounded-t-xl` so it matches the new container radius (verify file & line in build mode before editing).

**E. `ColorPickerDialog.tsx` TabsTrigger L228/L229 and swatch L324**
- Tabs (~32px tall): keep as `rounded-lg` → switch to `rounded-md` (matches sub-32px scale).
- Swatch button h-8 (L324): keep `rounded-lg` → switch to `rounded-md`.

## Out of scope

- No padding, color, border, spacing, typography, or layout changes.
- No edits outside `src/components/app/product-images/**` and `src/pages/ProductImages.tsx`.
- Children of shadcn primitives (Button, Input, Card, Dialog) keep their built-in radii.

## Verification after build

Spot-check Step 1 grid, Step 2 scene cards, Step 3 settings panels + reference thumbs, Step 4 review summary, Step 5 generating loader, Color picker, Brand Models/Scenes modals — every container surface should share the same corner radius.
