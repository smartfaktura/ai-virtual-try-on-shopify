

# Simplify Scene Settings: Remove Per-Scene Controls & Auto-Derive from Context

## Summary

Remove the per-scene expanded settings panels (shadow, spacing, lighting, surface, mood, product size, prominence, etc.) from the Refine step UI. These values will be **auto-derived** in the prompt builder from: (1) the product's backend analysis, (2) the user's background selection, and (3) the scene template itself. The user keeps control over Background (the strip), Outfit & Model, and Custom Note — everything else is automated.

## What Gets Removed from UI

**Entire expanded scene panels** — clicking a scene card no longer opens settings. The following controls are removed:

| Block | Fields removed |
|---|---|
| `background` (per-scene) | Tone, Shadow, Spacing |
| `visualDirection` | Mood, Product Size/Prominence, Lighting |
| `sceneEnvironment` | Environment, Surface, Styling density |
| `detailFocus` | Focus area, Crop intensity |
| `angleSelection` | Number of views |
| `productSize` | Product size selector |
| `packagingDetails` | Packaging state, reference strength, upload |
| Template controls | Lighting, Shadow, Mood, Surface, Background family, Accent, Prominence |

**Kept in UI**: Background swatch strip, Outfit & Model section, Custom Note, Action Details (for on-model action scenes like "In-Hand").

## What Gets Auto-Derived in Prompt Builder

All removed settings will use smart defaults based on product analysis + scene context:

- **Product size** → from `analysis.sizeClass` (already exists in `resolveToken('productSize')`)
- **Shadow** → from `defaultShadow(category)` (already exists)
- **Lighting** → from `defaultLighting(category)` (already exists)
- **Surface** → from `defaultSurface(category)` (already exists)
- **Styling** → from `defaultStyling(category)` (already exists)
- **Background** → from user's background strip selection (already injected globally)
- **Composition/spacing** → removed from prompt; scene templates define framing
- **Focus area** → from `resolveFocusArea()` using scene type defaults (already exists)

The prompt builder already has robust fallback logic for every token — when `isAuto()` returns true (no user override), it calls category-aware defaults. By removing the UI controls, all values will always be `auto`/`undefined`, so the existing defaults kick in automatically.

## Changes

### File 1: `src/components/app/product-images/ProductImagesStep3Refine.tsx`

1. **Remove scene card expansion** — make scene cards non-clickable (no settings gear icon, no `toggleSceneExpand`, no `renderExpandedPanel`). Exception: keep `actionDetails` expandable for on-model action scenes.
2. **Remove `BlockFields` function** for all blocks except `actionDetails`.
3. **Remove `TemplateControlChips`** and `getTemplateControls` functions entirely.
4. **Remove `AutoAestheticButton`** — no longer needed since there are no aesthetic controls to auto-set.
5. **Simplify scene cards** — show scene thumbnail + title only, no gear icon, no "customized" badge, no expand behavior (except action scenes).
6. **Remove `sceneHasControls`**, `getSceneBlockLabels` helpers.
7. **Remove customization count / reset** — `customizedCount`, `handleReset`, and the header badges since there's nothing to customize per-scene.

### File 2: `src/lib/productImagePromptBuilder.ts`

1. **Remove `injectIfMissing` calls** for `shadowDirective`, `surfaceDirective`, `stylingDirective`, `compositionDirective`, `sceneIntensityDirective`, `stylingDensityDirective`, `productProminenceDirective` — these were only needed when user could override. Now all values are auto, and the template tokens resolve to category defaults.
2. **Keep `injectIfMissing`** for `lightingDirective`, `outfitDirective`, `personDirective`, `bodyFramingDirective` — these are essential for consistency.
3. **Force `productSize` token** to always resolve from `analysis.sizeClass` — ignore `details.productSize` since user can no longer set it.
4. **Keep background injection** — the background strip is still user-controlled.

### File 3: `src/components/app/product-images/detailBlockConfig.ts`

1. **Remove blocks from `DETAIL_BLOCKS`** that no longer appear in UI: `background`, `visualDirection`, `sceneEnvironment`, `detailFocus`, `angleSelection`, `productSize`, `branding`, `layout`.
2. **Keep**: `personDetails`, `actionDetails`, `packagingDetails` (packaging reference upload is useful), `customNote`.

### File 4: `src/components/app/product-images/types.ts`

No structural changes — keep all `DetailSettings` fields for backward compatibility with existing saved sessions and prompt builder usage.

## What Users Still Control

1. **Background** — the swatch strip (applies globally to all scenes)
2. **Model & Outfit** — model picker, outfit presets, customization, appearance
3. **Action details** — for on-model action scenes (holding, applying, etc.)
4. **Custom note** — free text instructions
5. **Packaging reference** — upload for packaging scenes (keep in expandable panel for packaging scenes only)

## Result

The Refine step becomes dramatically simpler: scenes are displayed as a visual grid (no gear icons), background strip for color selection, outfit section for model scenes, and a custom note. All technical photography settings are handled automatically by the prompt engine using product analysis data.

