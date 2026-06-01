## Wedding Dresses page polish + hub card

### 1. Add hub card on `/ai-product-photography`
Insert a "Wedding Dresses" entry in `src/data/aiProductPhotographyCategories.ts`:
- 44 shots, 3 bridal preview imageIds for the card collage (Grand Staircase Veil, Atelier Mirror, Tuscan Bridal Gown)
- Subcategories: A-Line, Mermaid, Ball Gown, Sheath, Slip, Mini
- Description + alt text on-brand with the other category cards

### 2. Replace the 6 motion clips with the new uploads
The current `wedding-dresses-motion-1..6.mp4` files in `src/assets/seo/` are the wrong clips. Replace them with the 6 freshly uploaded MP4s (`1.mp4`…`6.mp4`) via the Lovable Assets CDN so they don't bloat the repo:
- Upload each via `lovable-assets create --file /mnt/user-uploads/N.mp4 --filename wedding-dresses-motion-N.mp4`
- Write `.asset.json` pointers to `src/assets/seo/wedding-dresses-motion-N.mp4.asset.json`
- Delete the old in-repo `.mp4` files
- Regenerate `wedding-dresses-motion-3.jpg` poster from the new clip 3 (used by hero tile)

### 3. Wire up the Motion Showcase for wedding-dresses
Currently `CategoryMotionShowcase.tsx` only renders for `bags | swimwear | activewear | eyewear | hoodies`, so the wedding page shows no Motion section. Add `'wedding-dresses'` to:
- `MotionSlug` type
- `CLIPS_BY_SLUG` (6 new clips + posters from CDN URLs)
- `COPY_BY_SLUG` ("Motion · Bridal in movement" / "Your gown, brought to life")
- Necessary imports of the new `.asset.json` pointers (plus 6 poster JPGs — generated from the new MP4s with ffmpeg)

### 4. Fix the hero collage VIDEO tile
Update `CategoryHero.tsx` `HERO_VIDEO_MAP['wedding-dresses-motion-3']` to point at the new CDN-hosted clip 3. The current import resolves to a stale/wrong file, which is why the VIDEO tile in the hero shows non-bridal content.

### 5. QA
- `/ai-product-photography` → confirm new Wedding Dresses card renders with 3 bridal previews
- `/ai-product-photography/wedding-dresses` → confirm hero VIDEO tile shows bridal motion + Motion Showcase section now appears with 6 new clips autoplaying

### Files touched
- `src/data/aiProductPhotographyCategories.ts` (new hub entry)
- `src/components/seo/photography/category/CategoryHero.tsx` (no source change, just new asset import target)
- `src/components/seo/photography/category/CategoryMotionShowcase.tsx` (add wedding-dresses slug + clips + copy)
- 6 new `src/assets/seo/wedding-dresses-motion-N.mp4.asset.json` pointers
- 6 new `src/assets/seo/wedding-dresses-motion-N.jpg` posters
- Removed: 6 old `src/assets/seo/wedding-dresses-motion-N.mp4` binaries + old poster
