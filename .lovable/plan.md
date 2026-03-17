

## Unoptimized Images on the Landing Page

I found **3 components** still serving heavy images directly from `public/` (uncompressed PNGs, ~1-2MB each) instead of the optimized storage bucket:

### 1. `HowItWorks.tsx` — 7 local images
- `/images/source-crop-top.jpg` (source product)
- `/images/try-showcase/studio-lookbook.png`
- `/images/try-showcase/cafe-lifestyle.png`
- `/images/try-showcase/golden-hour.png`
- `/images/try-showcase/garden-editorial.png`
- `/images/try-showcase/studio-back-detail.png`
- `/images/try-showcase/at-home-editorial.png`

### 2. `ChannelShowcase.tsx` — 13 local images
- `/images/source-crop-top.jpg`
- 12 images from `/images/try-showcase/*.png`

### 3. `CreativeDropsSection.tsx` — 1 local image
- `/images/source-crop-top.jpg`

**Total: ~19 unique unoptimized images** (some shared across components).

All other landing sections (HeroSection, FeatureGrid, ModelShowcase, EnvironmentShowcase, FreestyleShowcase, StudioTeam) already use `getLandingAssetUrl()` with optimized storage URLs.

---

### Fix Plan

1. **Upload** the ~15 unique files from `public/images/try-showcase/` and `public/images/source-crop-top.jpg` to the `landing-assets` storage bucket (under `try-showcase/` and `products/` folders)
2. **Update `HowItWorks.tsx`** — replace all 7 local paths with `getLandingAssetUrl()` calls + wrap in `getOptimizedUrl({ quality: 60 })`
3. **Update `ChannelShowcase.tsx`** — replace all 13 local paths with `getLandingAssetUrl()` calls + wrap in `getOptimizedUrl({ quality: 60 })`
4. **Update `CreativeDropsSection.tsx`** — replace the 1 local path with `getLandingAssetUrl()` call + wrap in `getOptimizedUrl({ quality: 60 })`

This will reduce total page weight by roughly **20-30MB** on full scroll, with each image going from ~1-2MB PNG to ~200-400KB compressed JPG.

