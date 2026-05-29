## Scope
Step 2 (Shots) of `/app/generate/product-images`: reposition the Brand Scenes promo banner and refine the "Explore more" header typography.

## Changes — `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

1. **Move BrandScenesPromoCard** — remove `<BrandScenesPromoCard />` from line 412 (top of Step 2). Re-render it inside the `unifiedOther.length > 0 || isLoadingRest` block (line 498) as the first child, so it appears right after the Recommended Shots section and immediately before the "Explore more" header.

2. **Improve "Explore more" header** (lines 500–503) — match the "Select shots" vibe used at line 416. Change:
   - `<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Explore more</h3>` → `<h3 className="text-lg font-semibold tracking-tight text-foreground">Explore more</h3>` (proper-case, no uppercase, larger).
   - `<p className="text-xs text-muted-foreground/80">Browse any category — you can mix shots from anywhere into one generation</p>` → `<p className="text-sm text-muted-foreground mt-1">Browse any category — mix shots from anywhere into one generation</p>`.
   - Wrap with `space-y-1` (already there) and add `pt-2` to the parent block for more vertical breathing room above the section.

No other edits to grid, lists, or behavior.
