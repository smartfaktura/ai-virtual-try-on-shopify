

## Swap 3 HowItWorks Scene Images

Replace `studio-dark.png` (black background), `urban-edge.png`, and `pilates-studio.png` with:
1. `/images/try-showcase/studio-lookbook.png` (already local)
2. The two uploaded images saved as new local assets

### Changes

**Copy uploaded images to public:**
- `user-uploads://freestyle-1_24-3.png` → `public/images/try-showcase/studio-back-detail.png`
- `user-uploads://racer_knitted_crop_top-virtual_try_on_set-isabella-front_view-1-2.png` → `public/images/try-showcase/at-home-editorial.png`

**File: `src/components/landing/HowItWorks.tsx`** (lines 10, 14-15)

Replace:
```typescript
const sceneStudio = '/images/try-showcase/studio-dark.png';
// ...
const sceneRooftop = '/images/try-showcase/urban-edge.png';
const sceneUrban = '/images/try-showcase/pilates-studio.png';
```

With:
```typescript
const sceneStudio = '/images/try-showcase/studio-lookbook.png';
// ...
const sceneRooftop = '/images/try-showcase/studio-back-detail.png';
const sceneUrban = '/images/try-showcase/at-home-editorial.png';
```

The 6-image grid in Step 3 will now show: Studio Lookbook, Café Lifestyle, Golden Hour, Garden Editorial, Studio Back Detail, At Home Editorial.

