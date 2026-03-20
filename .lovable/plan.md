

# Fix: Workflow Thumbnails & Scene Count Badges

## Problem 1: Thumbnails look bad
The `w-14 h-14` square with `object-contain` and `p-1` makes vertical workflow preview images appear as tiny slivers. The container is too small and `object-contain` doesn't work for portrait-oriented images in a square box.

**Fix**: Use a taller rectangular container (`w-16 h-20`, roughly 4:5) with `object-cover` and NO padding. This gives enough room for portrait images to display naturally without extreme cropping. The key difference from previous attempts: the container matches the natural portrait orientation of the source images, so `object-cover` only trims minimally.

## Problem 2: Scene counts are wrong
The badge shows `variations.length` from `generation_config.variation_strategy.variations`. But:
- **Virtual Try-On** has only 4 variations but dozens of actual scenes available (filtered `mockTryOnPoses`)
- **Product Listing** similarly has many more actual scenes than variations
- The count should reflect the real number of selectable scenes for each workflow

**Fix**: Calculate the correct scene count per workflow:
- For `uses_tryon` workflows → count of `ON_MODEL_CATEGORIES` filtered scenes from `mockTryOnPoses`
- For product workflows (no models) → count of `PRODUCT_CATEGORIES` filtered scenes
- For workflows that use variations as scenes (Flat Lay, Mirror Selfie, Selfie/UGC, Perspectives) → keep `variations.length`

Since `allScenePoses` depends on the *selected* workflow, we need to compute per-workflow scene counts inline.

## Changes

### File: `src/components/app/CreativeDropWizard.tsx`

**A. Fix thumbnail container** (lines 948-950)
```tsx
// Before
<div className="w-14 h-14 rounded-xl border border-border/50 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
  <ShimmerImage src={...} className="max-w-full max-h-full object-contain" aspectRatio="1/1" />
</div>

// After
<div className="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
  <ShimmerImage src={...} className="w-full h-full object-cover object-top" aspectRatio="4/5" />
</div>
```
No padding, no border, just a clean 4:5 rectangle with `object-cover object-top`. The 4:5 ratio closely matches the source images' portrait orientation, so minimal cropping occurs.

**B. Fix scene count badge** (lines 954-957)
Compute correct scene count per workflow card:
```tsx
const wfUsesVariationsOnly = !wf.uses_tryon && variations.length > 0;
const wfSceneCount = wfUsesVariationsOnly
  ? variations.length
  : (() => {
      const cats = wf.uses_tryon ? ON_MODEL_CATEGORIES : PRODUCT_CATEGORIES;
      return filterVisible(mockTryOnPoses).filter(p => cats.includes(p.category)).length + customScenePoses.filter(p => cats.includes(p.category)).length;
    })();
```
Then display `{wfSceneCount} scenes` instead of `{variations.length} scenes`. Only show the badge when count > 0.

## Summary
- 1 file, ~10 lines changed
- Thumbnails use 4:5 portrait containers with `object-cover object-top` — no grey, no tiny slivers
- Scene counts accurately reflect available scenes per workflow type

