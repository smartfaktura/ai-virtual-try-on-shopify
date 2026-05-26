## Problem

In the Add Props / Accessories modal (`ProductImagesStep3Refine.tsx`, `PropPickerModal`), the grid uses `flex-1 min-h-[320px]` inside the dialog's flex column. With few items (e.g. one), the single grid row stretches to fill the entire flex-1 area, making each tile absurdly tall — image sits at top, caption in middle, huge empty space below. Result matches the screenshot the user attached.

The Step 1 product picker doesn't have this problem because its grid lives in a normal page flow (no `flex-1` stretch).

## Fix (one file: `src/components/app/product-images/ProductImagesStep3Refine.tsx`, ~lines 469)

Replace the stretched grid with a scroll container that holds an auto-rows grid, so tiles size to content (aspect-square image + 52px caption) regardless of item count.

Change:
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 flex-1 min-h-[320px] max-h-[60vh] overflow-y-auto p-1">
```
to:
```tsx
<div className="flex-1 min-h-[320px] max-h-[60vh] overflow-y-auto p-1 -mx-1">
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 auto-rows-min content-start">
```
(close the extra wrapper before the "0 selected" footer).

That's it — same tile markup as Step 1, no logic changes. Tiles render as clean square thumbnail + caption, identical aesthetic to the products step.

## Out of scope
No changes to selection state, search, confirm/cancel, or callers.
