## Why model tiles stay white for so long on mobile

The "Pick a model. Start shooting." marquee on `/` renders its tiles via `ModelShowcaseSection.tsx`. Two compounding issues make the images take forever on mobile and explain the empty white squares in the screenshot:

1. **Full-resolution images served to 144px-wide tiles.**
   Each tile uses:
   ```ts
   getOptimizedUrl(model.previewUrl, { quality: 60 })
   ```
   No `width` is passed, so Supabase Storage's render endpoint returns the **original** model JPG (~1200–2000px, ~150–300 KB each) for a tile that is only `w-28 sm:w-32 lg:w-36` (112–144 CSS px) wide. On 4G/LTE this is 5–10× more bytes per tile than needed.

2. **Marquee tiles are tripled, so ~3× too many `<img>` elements load.**
   ```ts
   const tripled = [...items, ...items, ...items];
   ```
   But the marquee keyframes translate `-50%` (`@keyframes marquee-left` in `index.css`), which only requires the content to be **duplicated once** to loop seamlessly. Tripling forces ~50% more network requests than necessary across two rows (~30 models × 3 × 2 rows ≈ 180 image elements).

The screenshot confirms this: the first two tiles (Kai, Valeria) finished loading; Fatima/Akiko are still empty because their large originals are still being fetched by the browser's lazy loader as they scroll into view.

## Fix

### 1. Serve correctly-sized thumbnails

In `src/components/landing/ModelShowcaseSection.tsx` change the image source to:

```ts
getOptimizedUrl(model.previewUrl, { width: 320, quality: 55, resize: 'cover' })
```

- Why this is safe even with the project's "no width on full-bleed images" rule: these tiles are fixed-size thumbnails inside a fixed `aspect-ratio: 3/4` container with `object-cover object-top`. They are exactly the case the `getOptimizedSrcSet` JSDoc calls "fixed-size thumbnails (avatars, product chips)". `resize: 'cover'` plus the explicit width gives Supabase enough info to letterbox correctly without zoom-cropping the face.
- 320 px covers up to ~2× DPR for the `lg:w-36` (144 px) tile — sharp on iPhone Retina without overkill.
- Result: each tile drops from ~150–300 KB to ~10–25 KB.

### 2. Stop tripling the marquee items

In the same file, change:
```ts
const tripled = [...items, ...items, ...items];
```
to:
```ts
const doubled = [...items, ...items];
```
and use `doubled` in the `.map`. This matches the `-50%` translate animation and removes ~33% of the in-flight image requests with zero visual change.

### 3. Decode hint already correct

`ShimmerImage` already sets `loading="lazy"` and `decoding="async"`, so no further change there.

## Files

- `src/components/landing/ModelShowcaseSection.tsx` — two small edits (image URL + array duplication).

That's it. No backend, no schema, no new components.
