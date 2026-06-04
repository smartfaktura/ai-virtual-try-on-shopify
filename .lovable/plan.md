## Goal

Wire your 6 sock motion clips + 1 feed screenshot into `/ai-product-photography/socks`, and move the Scene Examples block up to be the **second section** (right under the hero) on the socks page only.

## What I'll do

### 1. Upload your assets as Lovable CDN assets

Mirror the phone-cases pattern (CDN-hosted `.asset.json` pointers, not bundled binaries).

- **6 motion clips** → upload each MP4 from `/mnt/user-uploads/` via `lovable-assets create` and write pointers to:
  - `src/assets/seo/socks-motion-1.mp4.asset.json` … `socks-motion-6.mp4.asset.json`
- **6 video posters** → extract the first frame of each MP4 with ffmpeg, then upload as JPGs to:
  - `src/assets/seo/socks-motion-1.jpg.asset.json` … `socks-motion-6.jpg.asset.json`
- **1 feed screenshot** (your `Socksfeed-1.jpg`) → upload to:
  - `src/assets/seo/socks-feed.jpg.asset.json`

### 2. Register socks in the showcase components

- `src/components/seo/photography/category/CategoryMotionShowcase.tsx`:
  - Import the 6 socks `.asset.json` video + poster pointers.
  - Add `'socks'` to the `MotionSlug` union.
  - Add a `socks` entry to `CLIPS_BY_SLUG` (6 `{ video, poster }` pairs).
  - Add a `socks` entry to `COPY_BY_SLUG` — eyebrow "Motion · Socks in movement", heading "Your socks, brought to life", sub "Turn one sock photo into scroll-stopping motion for ads, reels and PDP loops", aria "AI-generated sock motion clip".
- `src/components/seo/photography/category/CategoryFeedShowcase.tsx`:
  - Import the `socks-feed.jpg.asset.json` pointer.
  - Add `'socks'` to `FeedSlug` and a `socks` entry to `FEED_BY_SLUG` — eyebrow "One sock · Whole feed", heading "Your entire sock feed from a single upload", sub copy + alt text tailored to on-leg sock editorials and lifestyle scenes.
- `src/components/seo/photography/category/CategoryHero.tsx`:
  - Import `socks-motion-1.mp4.asset.json` and add `'socks-motion-1': socksMotion1.url` to `HERO_VIDEO_MAP` so the hero collage's video tile plays one of your real motion clips (matches phone-cases behaviour).

### 3. Use the real motion clip in the socks hero collage

- `src/data/aiProductPhotographyCategoryPages.ts`:
  - In the socks `heroCollage`, swap the "Detail" tile for a "Video" tile that uses `videoSrc: 'socks-motion-1'` and the existing sneaker-detail still as its poster (`imageId: '1780561758765-d31zv2'`). The other 3 tiles stay as stills.

### 4. Move Scene Examples to second-section position (socks only)

- `src/pages/seo/AIProductPhotographyCategory.tsx`:
  - Render `<CategorySceneExamples page={page} />` immediately after `<CategoryHero />` when `page.slug === 'socks'`, and skip the later render of it for that slug. All other category pages keep their current order untouched.

### 5. Sanity-check

- Spot-check first frames from the videos are clean before uploading posters (re-extract at 0.5s if a frame is half-black).
- Confirm `/ai-product-photography/socks` renders: hero with the new video tile, scene examples right after, motion grid, feed strip, rest unchanged.

## Files

- new (CDN pointers, written via `lovable-assets`):
  - `src/assets/seo/socks-motion-1.mp4.asset.json` … `socks-motion-6.mp4.asset.json`
  - `src/assets/seo/socks-motion-1.jpg.asset.json` … `socks-motion-6.jpg.asset.json`
  - `src/assets/seo/socks-feed.jpg.asset.json`
- edit: `src/components/seo/photography/category/CategoryMotionShowcase.tsx`
- edit: `src/components/seo/photography/category/CategoryFeedShowcase.tsx`
- edit: `src/components/seo/photography/category/CategoryHero.tsx`
- edit: `src/data/aiProductPhotographyCategoryPages.ts` (socks heroCollage video tile)
- edit: `src/pages/seo/AIProductPhotographyCategory.tsx` (move SceneExamples to position 2 for socks slug)
