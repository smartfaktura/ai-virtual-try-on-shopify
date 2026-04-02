

# Improve Catalog Shot Prompt Templates

Replace all 30 catalog shot prompt templates and shared blocks in `src/lib/catalogEngine.ts` with the user's improved versions. Also rename two shots (`full_look` → `full_look_catalog`, `styled_flat_lay` → `clean_flat_lay`).

## Changes in `src/lib/catalogEngine.ts`

### 1. Update shared blocks (lines 747-749)

Replace `QUALITY_BLOCK` and `CONSISTENCY_BLOCK_*` with the improved versions:

- **QUALITY_BLOCK**: `ultra realistic ecommerce fashion photography, accurate garment construction, realistic fabric behavior, sharp textile detail, true-to-life proportions, premium catalog image quality, clean retouching, natural skin texture, commercially polished but not over-edited`
- **CONSISTENCY_BLOCK_MODEL**: Add `preserve exact product identity from reference, maintain correct garment color, fabric, wash, print, stitching, silhouette, trim, hardware, proportions, and construction details, no redesign, no added embellishments, no missing details` + existing model identity matching text
- **CONSISTENCY_BLOCK_PRODUCT**: Same product preservation text + existing no-people rules

### 2. Update all 30 shot promptTemplates and categoryOverrides (lines 341-671)

Every shot gets its prompt replaced with the user's tighter, cleaner version. Key improvements across all shots:

- Explicit `head to toe fully visible with feet entirely inside frame` on full-body shots
- Specific pose instructions (weight distribution, arm position, camera angle)
- Stricter anti-editorial language (`not dynamic fashion editorial`, `not candid, not cinematic, not outdoor`)
- Cleaner product-only prompts with less repetition
- Better category overrides for shoes, bags, hats, sunglasses, jewelry

### 3. Rename two shots

- `full_look` → `full_look_catalog` (label: "Full Look Catalog") — removes editorial connotation
- `styled_flat_lay` → `clean_flat_lay` (label: "Clean Flat Lay") — reflects single-product focus

### 4. Update `buildSupportWardrobePrompt` (line 257)

Make the wardrobe directive stricter: `supporting wardrobe must stay minimal, commercially styled, color-coordinated, and secondary to the hero product, no distracting patterns, no competing hero items`

### 5. Update references to renamed shot IDs

Search for `full_look` and `styled_flat_lay` across the codebase and update to new IDs. Affected files:
- `src/lib/catalogEngine.ts` (definition + any references in `EDIT_COMPATIBLE_FROM_ANCHOR`)
- `src/types/catalog.ts` (CatalogShotId type union)
- Any other files referencing these shot IDs

### Impact

- All prompt templates become more precise and ASOS/Zalando-aligned
- Reduced hallucination risk from vague language
- Ghost mannequin, flat lay, and macro shots get stricter isolation language
- Category overrides are more complete and specific

