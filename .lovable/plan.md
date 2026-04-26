## What's wrong

The category hero component at `src/components/seo/photography/category/CategoryHero.tsx` is the only image-rendering SEO component that **never reads from the override system**. It renders straight from the static config:

```tsx
// Big "Fallback" tile on the left
<SmartImage src={getOptimizedUrl(PREVIEW(page.heroImageId), ...)} />

// 2x2 collage tiles on the right
const previewUrl = PREVIEW(tile.imageId);
```

That's why your `/ai-product-photography/fashion` admin edits to `heroMain` and `heroCollage1-4` are saved to the DB, picked up everywhere else (e.g. the "Related categories" section reads them fine), but the hero itself shows the original images.

The matching slot keys already exist in `seoPageVisualSlots.ts` — `heroMain`, `heroCollage1`, `heroCollage2`, `heroCollage3`, `heroCollage4` — so no DB or config changes are needed. Only the component needs to consume them.

## The fix

In `src/components/seo/photography/category/CategoryHero.tsx`:

1. Import `useSeoVisualOverridesMap` and `resolveSlotImageUrl` / `resolveSlotAlt`.
2. Call the hook once at the top of `CategoryHero`.
3. Resolve `heroMain` for the single-image fallback path (uses `page.heroImageId` + `page.heroAlt` as the fallback).
4. For the collage path, resolve `heroCollage1`…`heroCollage4` per tile (use each tile's `imageId` + `alt` as the fallback).
5. Pass resolved URL + alt into `<SmartImage>` (and `HeroTile`).
6. Update the `HeroTile` helper to accept resolved `src` and `alt` instead of recomputing from `tile.imageId`.

The `pageRoute` for resolution is `page.url` (same as everywhere else in the category components).

That's it — purely a component change, no migrations, no admin changes.

## After the fix

- In the Lovable **preview**, the fashion hero will immediately show your admin edits.
- For **vovv.ai** to reflect the fix (and the override system in general), you still need to click **Publish → Update** as discussed in the previous plan. Both the missing override-read code from before AND this category-hero fix will ship in the same publish.
