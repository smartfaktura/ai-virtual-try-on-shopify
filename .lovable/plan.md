
Root cause confirmed: the section is not failing because of loader logic now — it’s failing because several filenames in `ProductCategoryShowcase.tsx` do not exist in your `landing-assets/showcase` storage folder.  
That’s why you only see “old” images: those are the first valid ones later in each array after the missing URLs fail.

Missing names currently referenced in code:
- Fashion: `fashion-activewear-track.jpg`, `fashion-leopard-sneakers.jpg`, `fashion-portrait-curls.jpg`, `fashion-white-dress-stadium.jpg`, `fashion-blonde-coat.jpg`
- Beauty: `beauty-perfume-ice.jpg`, `beauty-perfume-driftwood.jpg`, `beauty-perfume-splash.jpg`, `beauty-perfume-rocks.jpg`, `beauty-perfume-aloe.jpg`
- Home: `home-boucle-chair.jpg`

Implementation plan:

1) Update `src/components/landing/ProductCategoryShowcase.tsx` to replace all missing filenames with verified existing files from `showcase/` (same category style), so every URL resolves immediately.

2) Keep the current optimized loading strategy (current + preload next, intersection-based cycling, failed-image skipping), since it is correct and already reducing request pressure.

3) Add a small dev-only warning in `handleError` that logs the exact failed URL and category label, so future bad filenames are spotted instantly during testing.

4) Validate end-to-end after patch:
- No 404s for `.../storage/v1/render/image/public/landing-assets/showcase/...`
- All 4 cards rotate through multiple images without getting stuck on the fallback/older subset.
- Confirm both Preview and Published environments show the same behavior (to rule out stale cache mismatch).
