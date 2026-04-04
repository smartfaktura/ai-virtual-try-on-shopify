

# Prompt Engineering Audit — Product Image Scenes

## Issues Found

### 1. Empty token pollution
When optional tokens resolve to empty strings (e.g., `{{accentDirective}}`, `{{compositionDirective}}`, `{{moodDirective}}`), they leave behind phantom spaces and sometimes break sentence flow. The cleanup regex (`/\.\s*\./g`) only catches double periods — it misses trailing spaces before periods, orphaned commas, and multi-space gaps from 3+ empty tokens in a row.

**Fix**: Strengthen the post-resolution cleanup in `buildDynamicPrompt` — strip lines that resolved to only whitespace, collapse runs of spaces, and remove empty sentence fragments like `. .` or `, .`.

### 2. `{{focusArea}}` token used in non-detail scenes without fallback context
In scenes like `beauty_texture_formula` (line 162), `{{focusArea}}` appears mid-sentence but its fallback is the generic "key product construction details" — which makes no sense for a formula texture shot. Several scenes use `{{focusArea}}` as a sentence fragment rather than a standalone directive, producing awkward phrasing when the user hasn't set a value.

**Fix**: Add scene-type-aware fallback maps for `focusArea` — e.g., formula texture scenes default to "viscosity, translucency, and sheen", macro hardware scenes default to "clasp, zipper, stitching".

### 3. Missing negative prompt / exclusion directives
There is no mechanism to inject negative prompts (e.g., "no text overlays, no watermarks, no distorted anatomy, no extra fingers"). Many AI image models perform significantly better with explicit negatives, especially for hand/person scenes where anatomical errors are common.

**Fix**: Add a `NEGATIVE_SUFFIX` constant and a `buildNegativePrompt` function. Person scenes get anatomy-specific negatives ("no extra fingers, no distorted joints, correct hand anatomy"). All scenes get base negatives ("no watermarks, no text overlays, no chromatic aberration").

### 4. `{{handStyle}}` resolves to raw chip label
When a user selects a hand style like "polished-beauty", the token resolves to the raw string "polished-beauty" instead of a descriptive phrase. Same issue with `{{nailDirective}}` — "gel-polish" becomes just "gel-polish nails with clean manicure" instead of something photographic.

**Fix**: Add `HAND_STYLE_MAP` and `NAIL_MAP` lookup tables similar to `LIGHTING_MAP`, mapping chip values to descriptive photographic phrases.

### 5. `{{materialTexture}}` fallback is too generic
When no `analysis` exists, the fallback is "sharp surface texture and material detail" — this is vague and adds little photographic guidance. The product's `description` field is never used, missing an opportunity to extract material cues.

**Fix**: When analysis is missing, parse `product.description` for common material keywords (leather, glass, metal, fabric, ceramic, wood, plastic) and generate a relevant material directive. Fall back to a stronger generic: "crisp surface detail with visible material grain and finish quality".

### 6. `buildPersonDirective` doesn't include outfit or model reference
The person directive builder assembles presentation, age, skin tone, expression, hair — but never includes outfit or the selected model reference. These are built as separate tokens (`{{outfitDirective}}`, `{{modelDirective}}`), which means some templates that only use `{{personDirective}}` lose outfit and model context entirely.

**Fix**: Have `buildPersonDirective` optionally append outfit and model info when present, so templates using only `{{personDirective}}` still get the full person description.

### 7. No camera/lens language in any template
Professional photography prompts benefit significantly from explicit camera direction — "shot with 85mm lens", "f/2.8 shallow DOF", "eye-level angle". Currently zero templates include any lens or aperture language, which weakens realism.

**Fix**: Add a `{{cameraDirective}}` token that resolves based on scene type: macro scenes → "shot at f/2.8, 100mm macro lens", packshots → "shot at f/8, 50mm lens for minimal distortion", portraits → "shot at f/2, 85mm portrait lens". Default based on scene `triggerBlocks`.

### 8. Color accuracy / white balance language missing
Templates mention "true-to-life color accuracy" in only 2-3 scenes. Color fidelity is critical for ecommerce — every scene should include explicit color science direction.

**Fix**: Add to `QUALITY_SUFFIX`: "accurate white balance, true-to-life color reproduction" so every prompt gets it.

### 9. Consistency directive resolves to empty for most users
`{{consistencyDirective}}` resolves to empty string unless the user explicitly sets a consistency level in Refine. Since most users skip this, most prompts lose the consistency language entirely.

**Fix**: Default consistency to `'balanced'` instead of empty, so every prompt gets series-consistency language by default.

### 10. `outfitDirective` uses `(d as any)` cast — fragile
The `buildOutfitDirective` function casts to `any` to access `outfitStyle` and `outfitColorDirection`, which aren't on `DetailSettings`. If these fields are only on `PersonStyling` in `RefineSettings`, they'll never resolve from the `details` object passed to the builder.

**Fix**: Either add `outfitStyle` / `outfitColorDirection` to `DetailSettings`, or change the builder to accept the full `RefineSettings` and extract person styling properly.

---

## Implementation Plan

### File 1: `src/lib/productImagePromptBuilder.ts`

- Add `HAND_STYLE_MAP`, `NAIL_MAP` lookup tables
- Add `CAMERA_MAP` keyed by scene trigger type (macro, portrait, packshot, lifestyle, editorial)
- Add `FOCUS_AREA_DEFAULTS` map keyed by scene category/type
- Strengthen `QUALITY_SUFFIX` with color accuracy language
- Add `NEGATIVE_SUFFIX` constant and `buildNegativePrompt(scene)` function
- Add `{{cameraDirective}}` token resolution
- Fix `defaultMaterial` to parse `product.description` when analysis is missing
- Fix `buildPersonDirective` to include outfit + model reference
- Fix `buildHandDirective` and nail resolution to use lookup maps
- Default `consistency` to `'balanced'` when empty
- Remove `(d as any)` casts by adding `outfitStyle` / `outfitColorDirection` to token context
- Strengthen post-resolution cleanup: collapse multi-spaces, strip empty sentence fragments, remove orphaned punctuation
- Return `{ prompt, negativePrompt }` from `buildDynamicPrompt` (or append negative to main prompt if the generation API doesn't support separate negatives)

### File 2: `src/components/app/product-images/sceneData.ts`

- Add `{{cameraDirective}}` token to all ~80 templates in the appropriate position (after composition, before quality suffix)
- Fix `beauty_texture_formula` and similar scenes to use scene-specific `{{focusArea}}` phrasing
- Add a `sceneType` field to each scene (e.g., `'macro' | 'packshot' | 'portrait' | 'lifestyle' | 'editorial' | 'flatlay'`) used by camera directive resolution

### File 3: `src/components/app/product-images/types.ts`

- Add `sceneType?: string` to `ProductImageScene`
- Add `outfitStyle?: string` and `outfitColorDirection?: string` to `DetailSettings` (remove need for `as any` casts)

### File 4: `src/pages/ProductImages.tsx`

- Update `buildInstruction` call to pass `product.description` into the builder (already passed via product object — just ensure builder uses it)
- If generation API supports negative prompts, pass them separately; otherwise no change needed

