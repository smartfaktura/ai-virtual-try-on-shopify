

# Add Curator's Picks for Aesthetic Color Scenes

## Summary
Add a `suggested_colors` JSON column to the `product_image_scenes` table so admins can define recommended aesthetic colors per scene. In Step 3, show these curator picks above the generic presets when aesthetic-color scenes are selected.

## Changes

### 1. Database migration
Add a `suggested_colors` column (jsonb, nullable, default null) to `product_image_scenes`:
```sql
ALTER TABLE public.product_image_scenes
ADD COLUMN suggested_colors jsonb DEFAULT NULL;
```
Format: `[{"hex": "#5F8A8B", "label": "Teal Door"}, ...]`

### 2. `src/hooks/useProductImageScenes.ts`
- Add `suggested_colors` to `DbScene` interface: `suggested_colors: Array<{hex: string; label: string}> | null`
- Map it in `dbToFrontend` → add `suggestedColors` to `ProductImageScene`

### 3. `src/components/app/product-images/types.ts`
- Add `suggestedColors?: Array<{hex: string; label: string}>` to `ProductImageScene`

### 4. `src/pages/AdminProductImageScenes.tsx` — SceneForm
After the Trigger Blocks section (~line 760), add a conditional block:
- Only visible when `draft.trigger_blocks` includes `'aestheticColor'`
- Shows a "Curator's Picks" label with a small color-swatch editor
- Each pick has a hex input + label input + remove button
- "Add color" button to append new picks
- Stores as `suggested_colors` on the draft

### 5. `src/components/app/product-images/ProductImagesStep3Refine.tsx` — Step 3 UI
In the aesthetic color card (~line 2174):
- Collect `suggestedColors` from all selected aesthetic-color scenes, deduplicate by hex
- If curator picks exist, render a "Recommended for your shots" section above the generic presets grid — same swatch card style but with a subtle `bg-primary/5` wrapper and a star/sparkle badge
- Generic presets grid moves below with a "More colors" label
- Improve the description text: "Set a signature color that carries across doors, chairs, surfaces and props in {N} shots — creating a cohesive visual story."

## Files changed
1. DB migration — add `suggested_colors` jsonb column
2. `src/hooks/useProductImageScenes.ts` — type + mapping
3. `src/components/app/product-images/types.ts` — add field
4. `src/pages/AdminProductImageScenes.tsx` — curator picks editor in SceneForm
5. `src/components/app/product-images/ProductImagesStep3Refine.tsx` — show curator picks in Step 3

