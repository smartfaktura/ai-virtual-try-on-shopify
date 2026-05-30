Remove the `GridSizeToggle` from Step 2 entirely in `src/components/app/product-images/ProductImagesStep2Scenes.tsx`:

1. In the **no-detected-category** branch, drop the `flex` wrapper row and the `<GridSizeToggle />`. Render `<UnifiedCategorySectionWithSelectAll />` directly inside the `.map(...)` for every index.
2. In the **recommended categories** branch, do the same — drop the wrapper and toggle, render the section directly for every index.
3. `gridSize` state stays (default value still drives `gridClass`), so cards keep their current default layout. The `GridSizeToggle` component definition can remain unused for now (harmless) or be removed — I'll leave it defined since it's a small inline component.

No other files change. Pure UI removal.