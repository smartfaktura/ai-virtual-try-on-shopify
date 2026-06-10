## Why the hero didn't change

Eyewear renders a 4-tile `heroCollage` (Editorial · Video · Vintage · UGC), not the single `heroImageId`. `CategoryHero.tsx` only uses `heroImageId`/`heroMain` when no collage is provided. My previous edit swapped `heroImageId`, which the eyewear page never displays.

## Fix

Update `heroCollage[0]` (the "EDITORIAL" tile, top-left in the collage) on the eyewear entry in `src/data/aiProductPhotographyCategoryPages.ts`:

- `imageId`: `beauty-closeup-oversized-eyewear-1776150210659` → `apparel-oldmoney-outdoor-portrait-copy-copy-copy-copy-copy-1780507647655`
- `alt`: "AI eyewear old-money outdoor editorial portrait."

The other 3 collage tiles (Video, Vintage, UGC) stay as is. `heroImageId` also stays pointed at the new image (harmless; used by SEO og:image and sitemap).
