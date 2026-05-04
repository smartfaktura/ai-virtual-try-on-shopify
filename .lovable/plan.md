
## Problem 1: Per-Scene Outfit Navigation is Tedious

Currently, styling each scene requires: expand scene accordion → configure outfit → manually collapse → find next scene → expand it. No way to "save and move on."

### Solution: Add Save & Next button + auto-collapse

In `ProductImagesStep3Refine.tsx`, when a scene's outfit accordion is expanded:

1. **Add a "Save & Next" button** at the bottom of each expanded scene panel (next to existing reset/clear buttons area). Clicking it:
   - Keeps the current outfit config (already auto-saved via `updateSceneOutfit`)
   - Collapses the current scene
   - Auto-expands the next scene in the list (same product, or first scene of next product if at the end)
   - Shows a subtle toast "Saved" confirmation

2. **Add a "Save" button** (for the last scene, or when user just wants to confirm without advancing). This collapses the accordion and shows "Saved" toast.

3. **Visual: checkmark on styled scenes** — scenes that have a configured outfit show a small green check icon next to the scene number, giving at-a-glance progress.

---

## Problem 2: Results Grid Shows Wrong Aspect Ratio

The results grid already uses `img.aspectRatio` for the container but falls back to `1/1`. The real issue is:

### Fix in `ProductImagesStep6Results.tsx`:
- The grid thumbnails already respect `aspectRatio` — this is working. But the **lightbox** (`ImageLightbox.tsx`) shows images with `object-contain` and fixed max-heights without considering the original ratio — it works correctly since it uses `object-contain`.

### Fix: Ensure grid thumbnails use original ratio, not forced square
- Line 131: the fallback `'1/1'` should be removed or changed to `'4/5'` as default since most product images are portrait. But more importantly, check that `aspectRatio` is actually being passed through from generation results.

- **Grid cards**: currently use `object-cover` which crops non-square images. Change to `object-contain` with a neutral background so the full image is visible in its original ratio.

- **Lightbox**: Already uses `object-contain` — no changes needed. The lightbox correctly shows the full image.

---

## Technical Changes

### File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`

1. Build a flat ordered list of `{productId, sceneId}` pairs from the per-product scene groups
2. Add `handleSaveAndNext(currentProductId, currentSceneId)` callback:
   - Find current index in the flat list
   - If next exists: `setExpandedOutfitSceneId(next)`
   - If last: `setExpandedOutfitSceneId(null)` + toast "All scenes styled"
3. In the expanded scene panel (line ~2863), add a footer with "Save & Next" / "Done" buttons
4. Add a check icon overlay on styled scene rows

### File: `src/components/app/product-images/ProductImagesStep6Results.tsx`

1. Change `object-cover` to `object-contain` on grid thumbnails (line 138) and add `bg-muted/50` for letterboxing
2. Keep the `aspectRatio` style on the container so cards maintain proper proportions
