

## Fix Labels for Upscaled Images in Dashboard

### Problem
Upscaled images are stored in the `freestyle_generations` table with `quality` set to `'upscaled_2k'` or `'upscaled_4k'`. Both the **Recent Creations** gallery and **Activity Feed** don't check this field, so they incorrectly label upscaled items as "Freestyle".

### Changes — 2 files

#### 1. `src/components/app/RecentCreationsGallery.tsx`
- Add `quality` to the freestyle query select: `'id, image_url, prompt, quality, created_at'`
- Check if `quality` starts with `'upscaled_'` — if so, label as `'Enhanced'` instead of `'Freestyle'`
- Show resolution in subtitle: "2K" or "4K"

#### 2. `src/components/app/ActivityFeed.tsx`
- Add `quality` to the freestyle query select: `'id, prompt, quality, created_at'`
- For upscaled items, change the activity text from `Freestyle "prompt" generated` to `Enhanced to 2K — "prompt"` (or 4K)
- Use a different icon — `Sparkles` is already imported and appropriate for enhanced items

