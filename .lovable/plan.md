# Polish Select Models modal

File: `src/components/app/product-images/ProductImagesStep3Refine.tsx` (the full-picker `Dialog` around lines 224–296).

## 1. Match rounded corners to the "Done" button

The "Done" button uses the default Button radius (rounded-full feel matching the pill). Update the filter controls to match:

- **Tabs (All / Women / Men)** — currently `TabsList` with `h-8` and `TabsTrigger` `h-6` use default `rounded-md`. Switch to fully pill-rounded:
  - `TabsList` → add `rounded-full p-1`
  - `TabsTrigger` → add `rounded-full px-4`
- **Search input** — currently `h-8` with default `rounded-md`. Change to `rounded-full` and bump left padding so the search icon sits comfortably (`pl-9`). Container icon stays positioned the same.

No color or size changes — only border-radius polish so the controls visually rhyme with the "Done" pill.

## 2. Add Brand Models promo banner after the model grid

Inside the modal's scroll container (after the `modalFilteredGlobal` block, before the "no results" fallback), render a compact promo card that mirrors the style of `BrandScenesPromoCard` but for Brand Models:

- Left: small stack of 3 brand model thumbnails (reuse `BRAND_MODEL_THUMBNAILS` already defined in `BrandModelsInfoModal.tsx` — export it from there).
- Middle: headline "Create your brand's own AI models" + subtitle "Build unique models from a simple wizard or your own model photos".
- Right: outlined pill button "Create Brand Models" → opens the existing `BrandModelsInfoModal` (reuse the `brandInfoOpen` state already in `ModelPickerSections`).
- Container: `rounded-xl border border-primary/20 bg-primary/[0.04] p-4`, only shown when modal is open (it lives inside the dialog content anyway).

This gives users a clear path to create their own brand models even when scrolling through the full VOVV.AI library.

## Technical notes

- Export `BRAND_MODEL_THUMBNAILS` from `BrandModelsInfoModal.tsx` so the new promo can reuse the same imagery.
- `BrandModelsInfoModal` is already imported and rendered once in `ModelPickerSections`; the new banner's button just calls `setBrandInfoOpen(true)` — no duplicate modal mount needed.
- All radius changes use Tailwind utility classes; no design token changes.
