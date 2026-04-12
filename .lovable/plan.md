

# Scene-Controlled Outfit: Universal `outfit_hint` Trigger

## What it does
Any scene can define a custom styling prompt (`outfit_hint`) that **replaces the entire Outfit Lock panel** in Step 3. This is not tied to aesthetic color — it's a universal override. The hint can contain dynamic tokens like `{{aestheticColor}}`, `{{productName}}`, etc., which get resolved at generation time just like any other template token.

## Changes

### 1. Database migration
Add `outfit_hint text` column (nullable) to `product_image_scenes`.

### 2. Types & Hook
- `ProductImageScene` in `types.ts`: add `outfitHint?: string`
- `DbScene` in `useProductImageScenes.ts`: add `outfit_hint: string | null`, map in `dbToFrontend()`

### 3. Admin Panel (`AdminProductImageScenes.tsx`)
Add a **"Scene Outfit Direction"** textarea in the scene form, visible when `personDetails` or `actionDetails` is in trigger blocks. Placeholder: `"e.g. coordinated sportswear in {{aestheticColor}} tones, clean minimal styling"`. Helper text explains dynamic tokens are supported.

### 4. Prompt Builder (`productImagePromptBuilder.ts`)
In `resolveToken` case `'outfitDirective'` (line ~890): if `scene.outfitHint` exists, return the hint with `{{aestheticColor}}` replaced by `details.aestheticColorHex` (or `"coordinated"` fallback), and `{{productName}}` replaced by `ctx.productName`. Skip the standard `defaultOutfitDirective()` entirely.

Also in `buildPersonDirective` (line ~714-727): same check — when `scene.outfitHint` is present, use it instead of calling `defaultOutfitDirective()`.

### 5. Step 3 UI (`ProductImagesStep3Refine.tsx`)
Detect if **all** selected scenes with person/action triggers have `outfitHint` set. If so:
- Hide the `OutfitPresetsOnly` + `OutfitPieceFields` sections
- Show instead a read-only info card: *"Outfit is directed by the selected shots"* with a small editable textarea labeled **"Custom styling note (optional)"** that saves to `details.customOutfitNote`
- The `customOutfitNote` gets appended to the scene's `outfitHint` at generation time if provided

If only **some** scenes have `outfitHint`, show the normal outfit panel with a note: *"Some shots have their own styling direction — outfit settings apply to remaining shots only."*

### 6. `DetailSettings` type update
Add `customOutfitNote?: string` to `DetailSettings` in `types.ts`.

## Files changed
1. **DB migration** — add `outfit_hint text` column
2. **`src/components/app/product-images/types.ts`** — add `outfitHint` to `ProductImageScene`, `customOutfitNote` to `DetailSettings`
3. **`src/hooks/useProductImageScenes.ts`** — add to `DbScene` + mapping
4. **`src/pages/AdminProductImageScenes.tsx`** — outfit hint textarea in scene form
5. **`src/lib/productImagePromptBuilder.ts`** — use `outfitHint` with dynamic token replacement in `outfitDirective` resolver + `buildPersonDirective`
6. **`src/components/app/product-images/ProductImagesStep3Refine.tsx`** — conditionally hide outfit panel, show scene-directed info + optional user note

