

# Optimize Remaining Unoptimized Thumbnails

After auditing all image sources across the app, here are the remaining locations where Supabase storage images are rendered as small thumbnails without `getOptimizedUrl` compression.

---

## Files to update

### 1. Team avatar images (~26 files, but focus on high-traffic ones)

Team avatars (`member.avatar`) are Supabase storage URLs via `getLandingAssetUrl` and are rendered at 6–24px across many components without optimization.

**Files:**
- `src/components/app/DashboardTeamCarousel.tsx` — 80–96px avatars
- `src/components/app/SidebarTeamAvatar.tsx` — 24–28px avatars
- `src/components/app/DashboardTipCard.tsx` — 36px avatar
- `src/components/app/MetricCard.tsx` — 24px avatar
- `src/components/app/QueuePositionIndicator.tsx` — 24px avatar
- `src/components/app/MultiProductProgressBanner.tsx` — 24px avatar
- `src/components/app/WorkflowRequestBanner.tsx` — 28–36px avatars
- `src/components/app/GlobalGenerationBar.tsx` — 24–28px avatars
- `src/components/app/LibraryDetailModal.tsx` — 40px avatar (Luna)
- `src/components/app/video/VideoResultsPanel.tsx` — 28px avatars
- `src/pages/video/AnimateVideo.tsx` — 28px avatars
- `src/pages/Perspectives.tsx` — 32px avatar
- `src/lib/brandedToast.tsx` — 24px avatar
- `src/components/landing/FinalCTA.tsx` — 40px avatars

Each: wrap `member.avatar` / `tip.avatar` / equivalent with `getOptimizedUrl(..., { quality: 60 })`.

### 2. Product/model thumbnails in CreativeDropWizard
**File: `src/components/app/CreativeDropWizard.tsx`**
- Line 880: product grid thumbnails — `product.image_url`
- Line 907: product list thumbnails — `product.image_url`
- Line 1136: model grid ShimmerImage — `m.image_url`
- Line 1829: summary product thumbnails (32px) — `p.image_url`
- Line 1918: summary model avatars (24px) — `model.image_url`

### 3. Perspectives page thumbnails
**File: `src/pages/Perspectives.tsx`**
- Line 782: library picker grid — `item.imageUrl`
- Line 848: product picker grid — `product.image_url`

### 4. BrandModels page
**File: `src/pages/BrandModels.tsx`**
- Line 700: model card image — `model.image_url`
- Line 808: locked model card — `m.image_url`

### 5. VideoGenerate page
**File: `src/pages/VideoGenerate.tsx`**
- Line 52: source image thumbnail — `video.source_image_url`

---

## Pattern

All changes follow the same convention used everywhere else:
```tsx
import { getOptimizedUrl } from '@/lib/imageOptimization';

// Before
src={member.avatar}

// After
src={getOptimizedUrl(member.avatar, { quality: 60 })}
```

No width constraints. Quality-only compression to avoid zoom/crop distortion.

## Summary

| Category | Files | ~Image locations |
|---|---|---|
| Team avatars | 14 files | ~20 locations |
| Product/model thumbnails | 3 files | ~7 locations |
| Video source thumbnail | 1 file | 1 location |
| **Total** | **~18 files** | **~28 locations** |

