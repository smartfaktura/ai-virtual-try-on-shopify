

# Refine Step Overhaul: Scene-Driven Layout, Outfit Locking System, and UX Fixes

## Problems Identified

1. **"Visible Person Styling" is a random dump** — All person fields (hands, models, outfits, age, skin tone) are thrown into one collapsed section with no scene context. User wants each scene that needs a person to show its own auto-selected defaults inline, editable if needed.

2. **No outfit locking system** — The backend has `defaultOutfitDirective()` with hardcoded outfits (e.g., "beige trousers, white sneakers" for garments), but users can't see or control this. Need a Catalog Studio-inspired outfit lock panel where users see the pre-written outfit and can edit specific pieces (top, bottom, shoes, accessories).

3. **"Clean Studio Shot" doesn't adapt to category** — The same `clean-packshot` scene template is used for garments (where it should be a ghost-mannequin or flat-lay) and bags (where it's a standard packshot). No category-aware prompt variant exists.

4. **Format & Output is collapsed** — This is one of the most important settings (aspect ratio, images per scene, credit estimate) but it's hidden in a collapsed section. Should be visible by default.

5. **"Customize per scene" is unclear** — The label "Customize per scene" under Format doesn't communicate that it's about adding props/accessories to specific scenes. Needs clearer labeling.

6. **"Use Smart Defaults" CTA looks bad** — The current button with "Active" badge doesn't look like a proper CTA. Should be more subtle, and the default should already be "product accent" for accent color.

7. **Accent color default** — When Overall Aesthetic is opened, accent color should default to "product-accent" (use product accent) rather than "none".

## Plan

### File 1: `src/components/app/product-images/ProductImagesStep3Refine.tsx`

**A. Restructure layout — Scene-driven sections instead of category-grouped:**

Replace the current structure of:
- Smart Defaults CTA (ugly)
- Scene strip
- Overall Aesthetic (collapsed)
- Person Styling (collapsed, all fields dumped)
- Scene-specific details (collapsed per scene)
- Custom Note
- Format & Output (collapsed)

With:
- **Format & Output (OPEN by default)** — aspect ratio, images per scene, credit estimate. Moved to top since it's critical.
- **Overall Aesthetic** — collapsed, with note about universal scenes. Default accent color to `product-accent`. Remove the big "Smart Defaults" button; replace with a smaller inline "Auto (Recommended)" chip that's already active by default.
- **Outfit Lock** (new section, only for categories with person scenes) — Catalog-style outfit control with pre-filled values per category. Shows: Top, Bottom, Shoes, Accessories as editable text chips. Locked across all on-model scenes.
- **Scene Details** — Each scene that has trigger blocks gets its own collapsible row showing: scene thumbnail, scene name, relevant controls (including inline person details if that scene needs a person, with auto-selected defaults shown). No separate "Person Styling" mega-section.
- **Custom Note** — stays at bottom.

**B. Remove "Smart Defaults" big CTA button:**

Replace with the existing `AutoAestheticButton` chip inside the Aesthetic section. The defaults are already applied on mount, so no need for a separate CTA.

**C. Change `AUTO_AESTHETIC_DEFAULTS` to set `brandingVisibility: 'product-accent'`** instead of `'none'`.

**D. Set `formatOpen` default to `true`** so Format & Output is visible immediately.

**E. Rename "Customize per scene" to "Scene Ratios & Props"** with description "Set per-scene aspect ratios or add styling accessories."

**F. Build `OutfitLockPanel` sub-component:**

A new inline component showing pre-filled outfit fields based on category:
- For garments: Top (default: "plain white t-shirt"), Bottom (default: "slim-fit beige trousers"), Shoes (default: "minimal white sneakers"), Accessories (default: "none")
- For bags: Top (default: "black turtleneck"), Bottom (default: "dark navy trousers"), Shoes (default: "black ankle boots"), etc.
- For shoes: Top (default: "plain white tee"), Bottom (default: "cropped slim dark denim"), etc.

Each field is a text input with the default pre-filled. Changes update `details.outfitStyle` and `details.outfitColorDirection` which feed into the prompt builder.

New `DetailSettings` fields: `outfitTop`, `outfitBottom`, `outfitShoes`, `outfitAccessories` (all optional strings).

**G. Move person details inline per scene:**

For each scene that has `personDetails` in its triggerBlocks, show a compact row of auto-selected chips (presentation, age, skin tone) below that scene's collapsible. The model picker stays as a top-level option since it applies globally.

### File 2: `src/components/app/product-images/types.ts`

Add new fields to `DetailSettings`:
```ts
outfitTop?: string;
outfitBottom?: string;
outfitShoes?: string;
outfitAccessories?: string;
```

### File 3: `src/lib/productImagePromptBuilder.ts`

**H. Update `defaultOutfitDirective` to read from DetailSettings outfit fields:**

If `outfitTop`, `outfitBottom`, `outfitShoes` are set, build the outfit string from those instead of the hardcoded defaults. Fall back to category defaults if empty.

**I. Add category-aware prompt override for `clean-packshot`:**

In `buildDynamicPrompt`, when scene is `clean-packshot` and category is `garments`, inject "ghost mannequin or flat-lay style" into the prompt. For other categories, use the standard packshot template. This can be done via `categoryOverrides` on the scene definition or inline in the prompt builder.

### File 4: `src/components/app/product-images/sceneData.ts`

**J. Add category note to `clean-packshot` description:**

Update description: "Pure white background cut-out. For clothing: ghost mannequin or flat-lay style. For accessories and products: standard packshot."

Add to the scene's `promptTemplate` a `{{categoryPackshotDirective}}` token that resolves differently per category.

## Files to Update

| File | Change |
|------|--------|
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Major restructure: Format on top (open), outfit lock panel, scene-inline person details, remove Smart Defaults CTA, rename Customize, default accent to product-accent |
| `src/components/app/product-images/types.ts` | Add `outfitTop/Bottom/Shoes/Accessories` to DetailSettings |
| `src/lib/productImagePromptBuilder.ts` | Read outfit fields, add `categoryPackshotDirective` token, update default outfit builder |
| `src/components/app/product-images/sceneData.ts` | Add `{{categoryPackshotDirective}}` to clean-packshot template |

