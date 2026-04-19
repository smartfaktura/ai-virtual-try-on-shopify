

## Goal

Remove `streetwear` and `skirts` as standalone categories. Both should fold back into `garments` (Clothing & Apparel). Any product the AI was about to classify as streetwear/skirts will now be classified as `garments` and pick up the standard apparel scene library — no orphaned/empty category screens.

## Verification first (already checked)

- DB: 0 rows in `product_image_scenes` use `category_collection = 'streetwear'` or `'skirts'`. Safe to remove from the admin dropdown — no scenes get orphaned.
- Code references found in 4 places that need cleanup.

## Changes

### 1. `supabase/functions/analyze-product-category/index.ts`
- Remove `"streetwear"` from `VALID_CATEGORIES` set.
- Remove the `streetwear` and `skirt` entries from `TITLE_CATEGORY_PATTERNS` (so titles like "graphic tee" or "pleated skirt" no longer route to a missing category).
- Remove the `streetwear` line from `GARMENTS_REFINEMENT_PATTERNS` (the demotion that turns generic `garments` into `streetwear`).
- Remove `streetwear` from the system prompt's `VALID CATEGORIES` list sent to Gemini, so the model never proposes it.
- Net effect: streetwear/skirt-like products land on `garments` and inherit Clothing & Apparel scenes.

### 2. `src/lib/categoryUtils.ts`
- Remove the `streetwear` rule (line 27) and the standalone `skirt` rule (line 38) from `DETECTION_RULES`.
- Add `'skirt'`, `'mini skirt'`, `'maxi skirt'`, etc. into the existing `garments` keyword list (line 39) so skirts still get detected as Clothing & Apparel.
- Remove `streetwear: 'Streetwear'` and `skirts: 'Skirts'` from `categoryLabels`.

### 3. `src/components/app/product-images/types.ts`
- Remove `'streetwear'` and `'skirts'` from the `TemplateCategory` union (line 40 area).

### 4. `src/pages/AdminProductImageScenes.tsx`
- Remove `{ value: 'streetwear', label: 'Streetwear' }` and `{ value: 'skirts', label: 'Skirts' }` from the Fashion group in `CATEGORY_GROUPS`.

## Untouched (intentionally)

- `src/lib/catalogEngine.ts` — `streetwear_clean` is a *photography style preset*, not a product category. Different system, leave alone.
- `supabase/functions/generate-tryon/index.ts`, `CreativeDropWizard.tsx`, `FreestyleQuickPresets.tsx`, `studio-chat/index.ts` — all use `streetwear` as a *scene/aesthetic mood* label, not a product category. Leave alone.
- DB: no migration needed (zero rows use these values).

## Result

- Edit dialog at `/app/admin/product-image-scenes` no longer offers Streetwear or Skirts.
- AI product analyzer never returns `streetwear` or `skirts` — graphic tees, hoodies-style oversized tees, and any skirt land on `garments` (Clothing & Apparel) and get the proper scene library.
- No empty category states, no orphaned scenes, no dead links.

