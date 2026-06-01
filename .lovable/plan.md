## Wedding dresses hero — swap video clip + fix tile labels

### 1. Replace hero VIDEO clip
- Delete current `src/assets/seo/wedding-dresses-motion-3.mp4.asset.json` (and its `.jpg` poster pointer)
- Upload `/mnt/user-uploads/1-7.mp4` → new pointer at the same path
- Regenerate poster JPG (ffmpeg frame grab) → new `.jpg.asset.json` at same path
- No code/wiring changes — `HERO_VIDEO_MAP['wedding-dresses-motion-3']` and `weddingDressesMotion3` import resolve to the new asset automatically

### 2. Realign hero collage so labels match imagery
Edit `heroCollage` in `src/data/aiProductPhotographyCategoryPages.ts` (lines 1715–1716):

| Tile | New imageId | Reason |
|------|-------------|--------|
| ATELIER | `1778332154533-vr8cht` Atelier Mirror | true indoor atelier studio |
| GARDEN | `1780307463188-xreub7` Tuscan Bridal Gown | solo bride walking lush tuscan villa garden |

EDITORIAL (Cliffside Goddess) and VIDEO tile poster stay the same. Alt text updated to match the new images.

### QA
Refresh `/ai-product-photography/wedding-dresses` → VIDEO tile plays the new clip; ATELIER shows the mirror studio; GARDEN shows the tuscan villa walk.
