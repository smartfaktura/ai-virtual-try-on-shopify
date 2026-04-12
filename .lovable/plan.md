

# Add "Aesthetic Color" Trigger Block for Consistent Scene Color Theming

## Concept
A new trigger block called `aestheticColor` that, when present on a scene, tells the prompt engine to inject a user-chosen hex color as the dominant environmental/accent color across all scenes sharing that trigger. The result: a door, a chair, a wall, a surface — all rendered in the same aesthetic color, creating a cohesive visual series.

Like the reference images: sneakers on a blue-teal door, sneakers on a matching teal-green chair — same color family tying the series together.

## Implementation

### 1. Register the trigger block
**`src/components/app/product-images/detailBlockConfig.ts`**
- Add `'aestheticColor'` to the `ALL_TRIGGER_KEYS` array
- Add `aestheticColor: ['aestheticColorHex']` to `BLOCK_FIELD_MAP`

### 2. Add field to DetailSettings type
**`src/components/app/product-images/types.ts`**
- Add `aestheticColorHex?: string` to `DetailSettings` interface (the user-selected hex)

### 3. Add UI color picker in Step 3 Refine
**`src/components/app/product-images/ProductImagesStep3Refine.tsx`**
- Detect scenes with `aestheticColor` trigger (same pattern as `bgScenes` detection on line ~1729)
- When present, render an "Aesthetic Color" section in the setup area — a compact color picker (reuse `ColorPickerDialog` + swatch grid pattern already used for backgrounds)
- Default swatches: Teal (#5F8A8B), Terracotta (#C4704B), Sage (#8B9B76), Dusty Rose (#C4868B), Slate Blue (#5C6B8A), Ochre (#C49B4B), Forest (#2D5F3E), Charcoal (#3D3D3D)
- Also offer custom hex input via the existing `ColorPickerDialog`
- Store selection in `details.aestheticColorHex`

### 4. Add token resolution in prompt builder
**`src/lib/productImagePromptBuilder.ts`**
- Add `aestheticColor` case in `resolveToken()`:
  - If `details.aestheticColorHex` is set and valid hex → return the hex value (e.g., `#5F8A8B`)
  - If not set → return `complementary tone derived from the product's dominant color`
- Add `aestheticColorDirective` case that returns a full sentence like: `The environment and props share a cohesive aesthetic color (${hex}) — doors, chairs, surfaces, and backgrounds should reflect this tone for visual consistency across the series.`

### 5. Scene template usage
Scene prompt templates can use either:
- `{{aestheticColor}}` — just the hex/color phrase (inline, e.g., `a {{aestheticColor}} painted door`)
- `{{aestheticColorDirective}}` — full instruction sentence appended to the prompt

**Example template:** `[PRODUCT IMAGE] {{productName}} hanging by laces from a {{aestheticColor}} painted door handle, matte paneled door, soft diffused daylight. {{lightingDirective}}`

### 6. Admin panel awareness
**`src/pages/AdminProductImageScenes.tsx`**
- The `aestheticColor` trigger is already supported via the existing trigger_blocks multi-select — no special admin UI needed. Scene creators just add `aestheticColor` to a scene's trigger_blocks array.

## No database changes needed
The `trigger_blocks` column already stores an array of strings, and `aestheticColor` is just a new string value.

## Summary of files changed
1. `src/components/app/product-images/detailBlockConfig.ts` — register trigger
2. `src/components/app/product-images/types.ts` — add field
3. `src/components/app/product-images/ProductImagesStep3Refine.tsx` — add UI picker
4. `src/lib/productImagePromptBuilder.ts` — add token resolution

