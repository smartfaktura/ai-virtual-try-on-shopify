# Speed up image loading on the AI Photography Hub + category pages

Same root cause as `/ai-product-photo-generator`: several components call `getOptimizedUrl(src, { quality: ... })` **with no width/height**, so Supabase serves the **full-resolution original** (~800 KB–1.5 MB each) for thumbnails that render at ~150–200 px. The hub renders these thumbs in dense 3-up collages across many cards.

## Audit results

I scanned every image-rendering component used by the listed pages. Three are unsized; everything else (`PhotographyHero`, `PhotographySceneExamples`, `CategoryHero`, `CategorySceneExamples`, `CategoryBuiltForEveryCategory`) already passes proper `width + height + resize: 'cover'`.

### Unsized offenders

1. **`PhotographyVisualSystem.tsx`** (line 96) — used on `/ai-product-photography`. 6 cards × 3 thumbs = **18 oversized images**.
2. **`PhotographyCategoryChooser.tsx`** (line 55) — used on `/ai-product-photography`. 10 cards × 3 thumbs = **30 oversized images**.
3. **`CategoryRelatedCategories.tsx`** (line 79) — used on **every** category page (`/ai-product-photography/fashion`, `/footwear`, `/beauty-skincare`, `/fragrance`, `/jewelry`, `/bags-accessories`, `/home-furniture`, `/food-beverage`, etc.). ~3 related cards × 3 thumbs = **9 oversized images per category page**.

So the hub alone ships **~48 unnecessarily huge JPGs** (~40 MB), and every category page ships **~9** (~10 MB) on top of its already-sized hero/examples.

## Fixes

### 1. `PhotographyVisualSystem.tsx` (hub)
Switch to sized + responsive srcSet. Tiles are ~140 px × 175 px on desktop in a 4:5 grid:
```ts
src={getOptimizedUrl(src, { width: 320, height: 400, quality: 70, resize: 'cover' })}
srcSet={getResizedSrcSet(src, { widths: [220, 320, 440], aspect: [4, 5], quality: 70 })}
sizes="(max-width: 640px) 32vw, (max-width: 1024px) 24vw, 140px"
width={320} height={400}
```

### 2. `PhotographyCategoryChooser.tsx` (hub)
Same pattern as the already-fixed `LandingCategoryGrid` — square thumbs at ~160 px:
```ts
src={getOptimizedUrl(src, { width: 300, height: 300, quality: 70, resize: 'cover' })}
srcSet={getResizedSrcSet(src, { widths: [200, 300, 400], aspect: [1, 1], quality: 70 })}
sizes="(max-width: 640px) 40vw, 160px"
width={300} height={300}
```

### 3. `CategoryRelatedCategories.tsx` (every category page)
`SmartImage` already accepts `srcSet` + `sizes` props — pass them through:
```ts
<SmartImage
  src={getOptimizedUrl(resolved, { width: 320, height: 320, quality: 70, resize: 'cover' })}
  srcSet={getResizedSrcSet(resolved, { widths: [220, 320, 440], aspect: [1, 1], quality: 70 })}
  sizes="(max-width: 640px) 32vw, (max-width: 1024px) 24vw, 160px"
  alt={t.alt}
  imgClassName="..."
/>
```

### 4. Already healthy — no change
- `PhotographyHero` — already sized (`width: 640, height: 854`)
- `PhotographySceneExamples` — already sized + srcSet
- `CategoryHero` — already sized (1120×1400 hero, 640×800 side tiles)
- `CategorySceneExamples` — already sized
- `CategoryBuiltForEveryCategory` — already sized
- `index.html` — Supabase storage preconnect already present

## Files to edit
- `src/components/seo/photography/PhotographyVisualSystem.tsx`
- `src/components/seo/photography/PhotographyCategoryChooser.tsx`
- `src/components/seo/photography/category/CategoryRelatedCategories.tsx`

## Expected impact
- `/ai-product-photography` hub: image bytes ~40 MB → ~3 MB on first load.
- Each category page: ~10 MB shaved off "Related Categories" alone.
- No visual change at any breakpoint.
