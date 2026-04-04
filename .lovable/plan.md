

# Product Images — Add Perspective & Catalog Scenes + Hide Support Icon

## 2 Changes

### 1. Add new global scenes from Perspectives and Catalog Studio

**Why**: Perspectives offers valuable angle/detail shots (back view, side angles, macro, top-down, wide/environment) and Catalog Studio offers product-only shots (ghost mannequin, on-surface) that are universally useful for any product category — not just fashion.

**New global scenes to add to `GLOBAL_SCENES` in `sceneData.ts`**:

| ID | Title | Description | Chips | Trigger Blocks | Source |
|----|-------|-------------|-------|----------------|--------|
| `back-angle` | Back Angle | Rear view showing the back of the product | Back, Reverse, 180° | `angleSelection` | Perspectives |
| `side-profile` | Side Profile | Left or right side view of the product | Side, Profile, 3/4 | `angleSelection` | Perspectives |
| `top-down` | Top-Down / Bird's Eye | Direct overhead view of the product | Overhead, Top, Flat | `angleSelection` | Perspectives |
| `macro-texture` | Macro Texture | Extreme close-up showing micro-details, textures, and material quality | Texture, Macro, Material | `detailFocus` | Perspectives |
| `wide-environment` | Wide / Context Shot | Pulled-back shot showing the product in a broader environment | Wide, Context, Environment | `sceneEnvironment`, `productSize` | Perspectives |
| `ghost-mannequin` | Ghost Mannequin | Invisible mannequin or floating product effect for clean product-only shots | Invisible, Clean, Product-only | `background` | Catalog Studio |
| `on-surface` | On Surface | Product placed naturally on a styled surface with subtle shadow | Surface, Natural, Shadow | `sceneEnvironment` | Catalog Studio |

**File**: `src/components/app/product-images/sceneData.ts` — add 7 new entries to `GLOBAL_SCENES` array

### 2. Hide support chat icon on /app/generate/product-images

**Current**: `StudioChat.tsx` already hides on mobile for certain pages and repositions for catalog pages using `isCatalogPage`.

**Fix**: Add a `hideCompletely` condition for the product-images generate page, similar to the existing `hideOnMobile` pattern.

**File**: `src/components/app/StudioChat.tsx`
- Add: `const isProductImagesPage = location.pathname === '/app/generate/product-images';`
- Add to the existing `hideOnMobile` condition OR create a new `if (isProductImagesPage) return null;` check that hides the floating button entirely on this page (to prevent overlap with the floating sticky bar)

## Summary

| File | Change |
|------|--------|
| `sceneData.ts` | Add 7 new global scenes (5 from Perspectives, 2 from Catalog Studio) |
| `StudioChat.tsx` | Hide chat widget on `/app/generate/product-images` |

