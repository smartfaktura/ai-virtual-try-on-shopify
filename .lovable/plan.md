

## Three issues to fix on Step 2 (Shots) — From Explore + mobile + wrong variant

### Issue 1 — Wrong variant still picked (watch shown for a beverage product)

Screenshot confirms: user picked a beverage can, but the "From Explore" card shows the **watches** Frozen Aura preview. So the resolver is still falling through past the category match.

Likely cause: the Discover handlers aren't actually appending `sceneCategory` / `sceneImage` for **scene-type** items the way the resolver expects (param name mismatch, or the scene's `category_collection` is missing in the source data path). Need to:
- Re-read `Discover.tsx` `handleUseItem` and `DiscoverDetailModal.tsx` Recreate CTA to confirm what params are actually emitted for a scene click.
- Re-read `ProductImages.tsx` resolver to confirm it reads the **same** param names.
- Add a final hard guarantee: when products are selected, **filter candidates to the product's category first**, and only then apply hint/image matching within that filtered set. That way even a missing `sceneCategory` can't return a watch when the product is a beverage.

### Issue 2 — Drop the emoji + add short context line on the "From Explore" section

Per memory rule (no decorative emojis, minimalist luxury restraint):
- Remove the ✨ before "FROM EXPLORE" label.
- Below the card, add a single muted line:
  *"Pre-selected from Explore. Add more shots below to get a richer set of visuals."*
- No period on the section label, keep period on the multi-sentence body copy (per project memory rule).

### Issue 3 — Mobile horizontal scroll bleed on Step 2

On 440px viewport the page can be scrolled left/right past the content edge. Almost certainly one of:
- The picker grid / category section has `overflow-x: auto` without `overflow-x-clip` on a parent, or
- A child uses negative margin / wide `min-w` that pushes layout past viewport, or
- The sticky bottom action bar (Back / Continue) is `w-screen` while parent has padding.

Fix approach (smallest possible):
- Add `overflow-x-clip` on the Step 2 root container.
- Audit any `min-w-[…]` / `w-[…]` inside `ProductImagesStep2Scenes.tsx` and the From-Explore card wrapper for fixed widths that exceed mobile viewport; switch to `w-full max-w-full`.
- Make sure the From-Explore card column doesn't force a 2-col grid at <640px (the screenshot shows it taking ~50% width on mobile, which is fine — but the underlying grid may be `grid-cols-2` with no mobile override).

### Files to change

```text
EDIT  src/pages/ProductImages.tsx
        - Resolver: when selectedProductIds.size > 0 AND product analyses
          are ready, FILTER candidates to {analysis.category} set FIRST,
          THEN apply sceneCategory / sceneImage / first-match within the
          filtered set. Never return a candidate outside the product's
          category once analyses are known.

EDIT  src/components/app/product-images/ProductImagesStep2Scenes.tsx
        - Remove ✨ from "FROM EXPLORE" label
        - Add muted helper line under the From-Explore card:
          "Pre-selected from Explore. Add more shots below to get a richer set of visuals."
        - Add overflow-x-clip on the root wrapper
        - Audit grid widths for mobile overflow; force max-w-full on the
          From-Explore card and its image wrapper

EDIT  src/pages/Discover.tsx  (only if param audit shows mismatch)
        - Confirm handleUseItem for scene items appends both sceneCategory
          AND sceneImage; fix if missing

EDIT  src/components/app/DiscoverDetailModal.tsx  (only if param audit shows mismatch)
        - Same audit on the Recreate CTA scene branch
```

No DB / RLS / edge-function changes. No impact on Freestyle, presets, or Add-to-Discover modal.

### Validation

1. From Explore → tap **beverages** Frozen Aura → Recreate → pick the beverage can → Step 2 → From-Explore card shows the **beverages** preview (not watches), pre-ticked.
2. Same flow with a Watches product → watches variant.
3. Section label reads "FROM EXPLORE" (no sparkle), with helper line beneath the card.
4. On 440px mobile viewport, the page **cannot** be scrolled horizontally past the content edge anywhere on Step 2.
5. No regression on prompt-only / preset / Freestyle Recreate paths.

