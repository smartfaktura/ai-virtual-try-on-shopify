
Fix `/ai-product-photography-for-ecommerce` by switching it to the same image behavior used in Discover, not the cropped landing-hero pattern.

1. Correct the image strategy on this page
- Remove the current forced `aspect-[3/4]` + `aspectRatio="3/4"` + `object-cover` setup from the hero and tab preview areas.
- Use the proven Discover-style rendering instead: natural-ratio images with `ShimmerImage` + `wrapperClassName="h-auto"` + `className="w-full h-auto block"`.
- Keep compression/optimization, but size URLs per section so images stay sharp without overfetching.

2. Fix all image sections consistently
- Hero grid: replace the fixed crop cards with natural-ratio cards so originals stay visible and never look zoomed.
- Outcome tabs: replace the forced portrait frame with a padded preview card that preserves original ratio; if height needs limiting, cap height without cropping.
- Showcase gallery: align it with the Discover/PublicDiscover card behavior and keep the masonry layout stable while images load.

3. Improve which presets the page selects
- Stop using a raw “first featured items” pull for this ecommerce page.
- Prefer presets that are clearly product-led: `product_name` / `product_image_url` present, and usually `model_name` absent.
- Keep tab matching by category, but rank ecommerce-relevant presets first so the page stops surfacing face closeups and beauty portraits where product visuals should appear.
- Deduplicate across hero, tabs, and showcase so the page feels curated instead of random.

4. Keep the design, but make it feel more like VOVV product discovery
- Reuse the same card language as the app’s discovery feed: muted card backgrounds, subtle borders, cleaner badges, less decorative cropping.
- Keep the current typography/spacing direction, but reduce visual noise until the image system is stable.

5. Small cleanup during implementation
- Remove or adjust the current `fetchPriority` usage that is triggering the React warning on this page.
- Keep above-the-fold images eager/preloaded, and leave the rest lazy.

Files to update
- `src/pages/seo/AIProductPhotographyEcommerce.tsx` — main fix: image selection, image rendering, hero/tabs/showcase layout
- `src/components/ui/shimmer-image.tsx` — only if needed for the fetch priority warning; avoid changing global image behavior unless it’s a safe, isolated fix

Technical details
- The previous implementation copied the wrong pattern: `HeroSection` and some landing showcases intentionally crop to fixed ratios for editorial cards.
- The correct reference for “original ratio, not zoomed” is `src/components/app/DiscoverCard.tsx` plus the stable multi-column approach in `src/pages/PublicDiscover.tsx`.
- For this page I would follow that pattern exactly instead of introducing another custom image treatment.
