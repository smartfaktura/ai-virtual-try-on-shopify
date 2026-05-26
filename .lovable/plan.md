Remove the `CheckCircle` icon from the "Your visuals are ready" header.

File: `src/components/app/product-images/ProductImagesStep6Results.tsx` (L108-114)

- Drop the `<div className="flex items-center gap-2.5">` wrapper and its `<CheckCircle …/>` child; render `<h1>` directly.
- Remove the now-unused `CheckCircle` import.

No other changes.