

## Fix: Restore original curated showcase images

### Problem
The previous fix replaced your hand-picked showcase images with completely different ones from storage. Your original images (`fashion-camel-coat.png`, `skincare-perfume-vanity.png`, `food-pavlova-berries.png`, etc.) don't exist in the storage bucket — they only exist locally in `public/images/showcase/`.

### Solution
Two options to fix this:

**Option A — Use local paths with quality note (fast fix)**
Revert the `CATEGORIES` array back to the original local image paths (`/images/showcase/...`). These are PNGs served directly from `public/` so they'll be ~2MB each, but they're the correct images.

**Option B — Upload originals to storage, then reference (proper fix)**
Upload the 18 original images from `public/images/showcase/` to the `landing-assets` storage bucket, then reference them via `s()` + `getOptimizedUrl()` for compression. This gives you both the right images AND fast loading.

### Recommendation: Option B
1. Upload all 18 files from `public/images/showcase/` to storage bucket `landing-assets/showcase/` (keeping same filenames)
2. Update `CATEGORIES` to use `s('fashion-camel-coat.png')`, `s('fashion-white-suit.png')`, etc. — the original selections
3. Keep `getOptimizedUrl(img, { quality: 60 })` for compression

### Original image selections to restore

| Category | Images |
|----------|--------|
| Fashion | `fashion-camel-coat.png`, `fashion-white-suit.png`, `fashion-knit-loft.png`, `fashion-activewear-gym.png` |
| Skincare | `skincare-serum-marble.png`, `skincare-perfume-vanity.png`, `skincare-serum-model.png`, `skincare-model-light.png` |
| Food | `food-avocado-toast.png`, `food-cocktail-bar.png`, `food-pavlova-berries.png`, `food-raspberry-dessert.png`, `food-cocktail-rocks.png` |
| Home | `home-candle-evening.png`, `home-vases-shelf.png`, `home-lamp-evening.png`, `home-bedroom-morning.png`, `home-pendant-kitchen.png` |

### Files to modify
- `src/components/landing/ProductCategoryShowcase.tsx` — restore original image filenames in `CATEGORIES`

**Note:** If the images can't be uploaded to storage right now, we'll fall back to Option A (local paths) which restores the correct images immediately, and we can migrate to storage later.

