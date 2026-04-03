

# Fix HomeTransformStrip & HomeHero — Rotation Speed, Static Original, Video, Mobile Sizing

## Issues
1. **TransformStrip "Original" card rotates** — should be static (one fixed product image)
2. **Output cards rotate at 500ms** — too fast, change to 1000ms (1 second)
3. **No Video card** in either section — add a 5th "Video" output card
4. **Hero banner also rotates output cards at 500ms** — change to 1000ms
5. **Hero banner missing video** — same fix, add Video card
6. **Mobile images too small** — increase card sizes on small screens

## Changes

### `src/components/home/HomeTransformStrip.tsx`

1. **Make Original card static** — remove `useRotatingIndex` from `OriginalCard`, pick one fixed product image (e.g. `hero-product-croptop.jpg`)
2. **Slow output cards to 1000ms** — change `useRotatingIndex(images.length, 500, delay)` → `1000`
3. **Add Video card** — add a 5th output card labeled "Video" with images from the hero set (since no .mp4 assets are used inline here, use 5 different hero images to represent video stills)
4. **Fix useRotatingIndex cleanup bug** — same pattern as the hero fix
5. **Mobile sizing** — change the grid from `grid-cols-2 sm:grid-cols-4` to `grid-cols-2 sm:grid-cols-5` for 5 cards; make mobile original card wider (`w-[40%]` → bigger) and output card aspect ratio slightly taller

### `src/components/home/HomeHero.tsx`

1. **Slow output cards to 1000ms** — change `intervalMs={500}` → `intervalMs={1000}`
2. **Add Video card** — add a 5th entry to `cardSets` labeled "Video" with hero images
3. **Adjust grid** — go from 3-col bento to accommodate 5 output cards (e.g. 2 left, center original, 2 right, plus 1 video card below or adjust to a wider layout)
4. **Mobile sizing** — increase `min-h` values and card sizes on small screens

## Files Modified
- `src/components/home/HomeTransformStrip.tsx`
- `src/components/home/HomeHero.tsx`

