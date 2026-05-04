
## Overview

Redesign the Style & Outfit section to show only 5 curated universal presets, make per-scene outfit status immediately clear (configured vs needs attention), preserve scene-built-in outfits by default, and fix the prompt builder gap that causes models to appear with incomplete outfits.

---

## 1. Reduce presets to 5 universal styles

**File: `src/lib/outfitVocabulary.ts`**

Remove all category-specific built-in presets (~50+ entries) and all extra universal ones. Keep exactly 5 universal presets with enriched, production-quality configs:

| Preset | Description | Key pieces |
|--------|-------------|------------|
| **Minimal Premium** | Clean basics, neutral tones, timeless | White fitted tee, black tailored trousers, black leather loafer, gold studs, black leather belt |
| **Editorial Fashion** | Campaign-ready, polished, high-fashion | Cream silk blouse, black wide-leg wool trousers, black pointed heels, gold drop earrings, structured black clutch |
| **Casual Everyday** | Relaxed lifestyle, still aesthetic | Grey cotton crewneck knit, light wash straight jeans, white leather low-top sneaker (no logos), small gold hoops |
| **Streetwear / Urban** | Oversized layers, denim, cargos | Black oversized hoodie, khaki cotton cargo trousers, white chunky sneaker, black cotton dad cap |
| **Sport / Active** | Gym, tennis, athleisure | Black fitted lycra crop top, black high-waist lycra leggings, white mesh chunky sneaker |

Each preset will have complete slot coverage (top + bottom + shoes + jewelry/accessories where appropriate) so no model ever appears with missing clothing.

Update `filterPresetsByCategories` to always return these 5 (category filtering no longer needed since all are universal).

---

## 2. Redesign outfit section UX

**File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`**

### Scene outfit status cards (always visible)
Each on-model scene shows a compact card with clear status:
- **Green check + "Scene styled"** — scene has a built-in `outfitHint` (used by default, no action needed)
- **Blue check + outfit summary** — user has selected a preset or custom outfit for this scene
- **Amber warning + "No outfit selected"** — scene has no built-in hint AND no user config; user needs to pick one

Scenes without outfits get a subtle amber border to draw attention without being alarming.

### Preset bar stays at top but simplified
The 5 preset pills appear at the top. Clicking one applies it to scenes that don't already have a built-in outfit hint (not all scenes). Scenes with built-in hints keep their direction unless user explicitly overrides.

### "Apply to all shots" becomes secondary
Move from a prominent full-width button to a small text link ("Apply one look to all shots") below the preset bar. This makes individual scene control the primary experience.

### Per-scene expand/edit
Clicking a scene card expands it to show the full outfit editor. For scenes with built-in hints, show "This shot has curated styling. Override below if needed." For scenes without config, guide: "Select a preset above or configure manually."

---

## 3. Fix incomplete outfit in prompt builder

**File: `src/lib/productImagePromptBuilder.ts`**

In `defaultOutfitDirective` (around line 728-732), after building the structured outfit string from `outfitConfig`, check for missing essential non-skipped slots. If `top`, `bottom`, or `shoes` are absent from the config but not in `skipSlots`, merge in values from `categoryOutfitDefaults`. This prevents the AI from generating models wearing only partial outfits.

```
Before: outfitConfig has top only → returns "Top: white cotton crew t-shirt" (no pants/shoes)
After:  merges defaults → returns "Top: white cotton crew t-shirt; Bottom: slim navy cotton chinos; Shoes: white leather sneakers"
```

---

## 4. Simplify OutfitPresetBar

**File: `src/components/app/product-images/OutfitPresetBar.tsx`**

- Remove `presetIsRelevant` filtering (all 5 presets always show)
- Remove "No presets fit this product" empty state
- Remove "Your saved looks" section header when only built-ins exist
- Keep "Save current" functionality for user custom presets
- Simplify header from "Suggested looks for your products" to just "Quick styles"

---

## Files changed

| File | Change |
|------|--------|
| `src/lib/outfitVocabulary.ts` | Replace ~50 presets with 5 enriched universal ones |
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Redesign outfit section: status indicators, amber/green states, secondary apply-all |
| `src/components/app/product-images/OutfitPresetBar.tsx` | Simplify to always show all 5 presets, remove filtering |
| `src/lib/productImagePromptBuilder.ts` | Gap-fill missing slots with category defaults |
