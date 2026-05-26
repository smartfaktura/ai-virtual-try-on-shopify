**1. ProductImagesStep2Scenes.tsx**
- Move the "Select shots" header block (`<h2>`, subtitle, badge/clear + GridSizeToggle) to render **after** `<BrandScenesPromoCard />`.
- Hide `<GridSizeToggle />` on mobile by wrapping it in `<span className="hidden sm:inline-flex">`.

**2. BrandScenesPromoCard.tsx**
- Replace the `Learn more` button styling. Current `variant="secondary"` is invisible on the tinted background. Use a clearly visible non-primary style: `variant="outline"` with `bg-background hover:bg-background border-border text-foreground` (solid white pill on the tinted card). Keep rounded-full and arrow icon.
- Pass `thumbnails` prop through to `<BrandScenesInfoModal thumbnails={thumbnails} />`.

**3. BrandScenesInfoModal.tsx**
- Accept optional `thumbnails?: string[]` prop.
- Widen on desktop: `max-w-md sm:max-w-lg` instead of `max-w-sm`.
- Add a row of 3 overlapping mini thumbnails (same style as promo card: rounded-lg, ring-2 ring-background, slight rotation, `-ml-3` overlap, ~`w-12 h-14`) above the eyebrow, centered. Use `ShimmerImage` + `getOptimizedUrl`. Skip rendering if no thumbnails.