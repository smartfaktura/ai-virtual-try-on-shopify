## Replace wedding dress videos with the new uploads

The 6 motion clips on `/ai-product-photography/wedding-dresses` are using the wrong videos. Swap in the 6 freshly uploaded MP4s.

### Steps
1. Delete the 6 existing CDN asset pointers (`src/assets/seo/wedding-dresses-motion-1..6.mp4.asset.json`) and their 6 poster pointers (`...-1..6.jpg.asset.json`) via `delete_asset`.
2. Re-upload the 6 new clips from `/mnt/user-uploads/` (`1.mp4`…`6.mp4`) with `lovable-assets create`, writing fresh `.asset.json` pointers to the same paths.
3. Regenerate 6 new poster JPGs from the new clips with ffmpeg and upload them as `.asset.json` pointers (same paths).
4. No source code changes — `CategoryHero.tsx` and `CategoryMotionShowcase.tsx` already import the pointer files, so the new CDN URLs flow through automatically.

### QA
- Hard-refresh `/ai-product-photography/wedding-dresses` → confirm hero VIDEO tile + the 6-tile Motion Showcase all play the new bridal clips with matching posters.
