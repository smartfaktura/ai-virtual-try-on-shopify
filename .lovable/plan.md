

# Optimize Final Batch of Unoptimized Thumbnails

After a thorough audit, here are the remaining files where Supabase storage images (via `getLandingAssetUrl` or `TEAM_MEMBERS`) are rendered without `getOptimizedUrl`.

---

## Files to update (8 files, ~15 image locations)

### 1. `src/components/app/WorkflowActivityCard.tsx`
- **Lines 100, 217, 272**: Team avatars (40px) — `member.avatar` / `team[0].avatar` used in `<AvatarImage>` without optimization (3 locations)

### 2. `src/components/app/StudioChat.tsx`
- **Lines 124, 128, 132, 183, 209**: `avatarSophia`, `avatarKenji`, `avatarZara` (28px) — 5 `<AvatarImage>` locations, all raw `getLandingAssetUrl` URLs

### 3. `src/components/app/ContactFormDialog.tsx`
- **Lines 98, 102, 106**: `avatarSophia`, `avatarKenji`, `avatarZara` (36px) — 3 `<AvatarImage>` locations

### 4. `src/components/app/video/CorrectionConfirmModal.tsx`
- **Line 42**: `m.avatar` (32px) — team avatars in confirmation modal

### 5. `src/components/app/freestyle/FreestyleGallery.tsx`
- **Lines 127, 181, 264, 306**: `crew.avatar` / `luna.avatar` (40–64px) — 4 `<img>` locations in generating/error/upscaling overlays

### 6. `src/components/app/BrandProfileWizard.tsx`
- **Line 58**: `avatar` (32px) — team tip avatars from `getLandingAssetUrl`

### 7. `src/components/app/OnboardingChecklist.tsx`
- **Line 104**: `member.avatar` (48–56px) — step avatars

### 8. `src/pages/About.tsx`
- **Line 156**: `member.avatar` (80px) — team grid on About page

### 9. `src/pages/Discover.tsx`
- **Line 177**: `member.avatar` (44px) — rotating avatars

### 10. `src/pages/Freestyle.tsx`
- **Line 1085**: `TEAM_MEMBERS.find(...).avatar` (20px) — Sophia hint avatar

### 11. `src/pages/video/AnimateVideo.tsx`
- **Line 688**: `m.avatar` (28px) — TIPS_TEAM avatars (already optimized at line 517 but missed at 688)

### 12. `src/components/app/LibraryImageCard.tsx`
- **Line 129**: `luna?.avatar` (40px) — upscaling overlay avatar

---

## Pattern

Same as all previous batches — import + wrap:
```tsx
import { getOptimizedUrl } from '@/lib/imageOptimization';

// Before
src={member.avatar}

// After
src={getOptimizedUrl(member.avatar, { quality: 60 })}
```

Quality-only compression. No width constraints.

## Summary

| Files | ~Image locations |
|---|---|
| 12 files | ~22 locations |

