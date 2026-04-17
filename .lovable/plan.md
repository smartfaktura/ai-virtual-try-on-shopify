

## Fix
The "When to use" / "Skip if" copy in `learnContent.ts` for `product-images` wrongly says to use Catalog Studio for 10+ SKUs. Product Visuals handles batches of products fine — that's literally what Step 04 (Generate) now promises.

## Change

In `src/data/learnContent.ts`, update the `vsAlternatives` block on the `product-images` guide:

- **Use it for** → "Multiple products with full creative control over scene, models, and framing — generate batches across your catalog in one pass."
- **Skip it if** → "You only need plain white-background ecommerce shots at scale — use Catalog Studio for that."

This keeps the comparison meaningful (Product Visuals = creative editorial batches, Catalog Studio = high-volume PDP basics) without falsely capping SKU count.

## Files
- `src/data/learnContent.ts` — single object edit on the `product-images` guide's `vsAlternatives`

No component changes needed — `ProductVisualsGuide` already renders `vsAlternatives` as the "When to use" rows.

