

# Improve Product Images: Category-Aware Universal Scenes, Accent Color, and Refine UX

## Problems Identified

1. **Universal scenes are not category-aware** — "In-Hand Studio" shows for furniture/home-decor products where it makes no sense. Each universal scene should have a compatibility list.
2. **"More Angles" is misleading** — It's a single scene that says "multi-angle" but generates 1 image. It should be removed and replaced with explicit angle scenes (Front, Side, Back, Top-Down) or clearly generate multiple outputs.
3. **Refine step is overwhelming** — No scene context visible, no quick "just use smart defaults" path. Users don't know what they're adjusting or for which scenes.
4. **Overall Aesthetic applies globally** — but editorial/recommended scenes often have their own mood; applying uniform background/lighting to those produces poor results.
5. **No product accent color stored** — The AI analysis already extracts `colorFamily` but there's no dedicated `accentColor` field. This should be extracted, persisted, and used as a dynamic default in the Aesthetic section.
6. **No "Dynamic Background" universal scene** — User wants a scene that uses the product's accent color as the background tone.

## Plan

### 1. Category Compatibility for Universal Scenes

**File: `src/components/app/product-images/sceneData.ts`**

Add an optional `excludeCategories` field to `ProductImageScene` type and populate it on universal scenes:

| Scene | Exclude Categories |
|-------|-------------------|
| In-Hand Studio | `home-decor`, `tech-devices` (large items) |
| In-Hand Lifestyle | `home-decor`, `tech-devices` |
| Product + Packaging | `garments` (no box) |
| Packaging Detail | `garments` |

**File: `src/components/app/product-images/types.ts`**

Add `excludeCategories?: string[]` to `ProductImageScene`.

**File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`**

Filter `GLOBAL_SCENES` through detected categories — hide scenes where ALL selected products fall into excluded categories.

### 2. Replace "More Angles" with Specific Angle Scenes

**File: `src/components/app/product-images/sceneData.ts`**

Remove the `more-angles` scene. Replace with 3 explicit scenes:
- **Side Profile** — Product from 90° side angle
- **Back View** — Product from behind showing back construction
- **Top-Down / Flat Lay** — Overhead bird's-eye view

Each produces 1 image with a clear, specific angle instruction in the prompt.

### 3. Extract & Store Product Accent Color

**File: `supabase/functions/analyze-product-category/index.ts`**

Add `accentColor` (hex code like "#D4A574") to the AI analysis schema. The AI already sees the image — ask it to extract the dominant/accent color as a hex value.

**File: `src/components/app/product-images/types.ts`**

Add `accentColor?: string` to `ProductAnalysis`.

**File: `src/hooks/useProductAnalysis.ts`**

Pass `accentColor` through from the response (no code change needed — it flows through `analysis_json`).

### 4. Add "Dynamic Accent Background" Universal Scene

**File: `src/components/app/product-images/sceneData.ts`**

Add a new universal scene:
- **ID**: `accent-backdrop`
- **Title**: "Accent Color Backdrop"
- **Description**: "Product on a background derived from its dominant color."
- **Prompt template**: Uses `{{accentColorDirective}}` token that resolves to the extracted hex from analysis.

**File: `src/lib/productImagePromptBuilder.ts`**

Add `accentColorDirective` token resolution — reads `accentColor` from product analysis and generates: "Background is a smooth gradient of [hex color], complementary to the product's dominant tone."

### 5. Scope Overall Aesthetic to Universal Scenes Only

**File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`**

Add a note under Overall Aesthetic: "Applies to universal scenes. Recommended scenes use their own optimized styling."

**File: `src/lib/productImagePromptBuilder.ts`**

When building prompts, skip injecting aesthetic overrides (background family, surface, lighting) for category-collection scenes — let their templates drive the look. Only inject aesthetic tokens for `isGlobal: true` scenes.

### 6. Simplify Refine Step UX

**File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`**

**A. Add "Use Smart Defaults" prominent action:**
At the top of the Refine step, add a large card/button: "Use Smart Defaults — We'll pick the best aesthetic based on your product's colors and category. Just click Review."

When clicked, it auto-sets:
- `accentColor` → from product analysis `accentColor`
- `backgroundFamily` → `auto`
- `lightingFamily` → category default
- All other fields → `auto`
- Collapses all sections

**B. Show selected scene thumbnails as context strip:**
Below the header, render a horizontal strip of small scene thumbnails (reusing `SceneCard` mini variant) so the user sees which scenes they're refining. This gives context without needing to go back.

**C. Default all collapsibles to collapsed** except "Overall Aesthetic" (which should show the Auto button prominently).

## Files to Update

| File | Change |
|------|--------|
| `src/components/app/product-images/types.ts` | Add `excludeCategories`, `accentColor` fields |
| `src/components/app/product-images/sceneData.ts` | Add exclusions to scenes, replace "More Angles", add accent backdrop scene |
| `src/components/app/product-images/ProductImagesStep2Scenes.tsx` | Filter universal scenes by category compatibility |
| `supabase/functions/analyze-product-category/index.ts` | Add `accentColor` hex extraction |
| `src/lib/productImagePromptBuilder.ts` | Add accent color token, scope aesthetic to universal scenes |
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Add smart defaults CTA, scene context strip, simplify layout |

