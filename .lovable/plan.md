

# Final Remaining Unoptimized Thumbnails

After a thorough audit, here are the last unoptimized Supabase storage image locations. Grouped by priority.

---

## High Priority — App UI Thumbnails

### 1. `src/components/app/freestyle/FreestyleQuickPresets.tsx`
- **Line 161**: `amara.avatar` (28px) — wrap with `getOptimizedUrl(..., { quality: 60 })`

### 2. `src/pages/Generate.tsx`
- **Line 4300**: Product summary thumbnail (48px) — `scratchUpload?.previewUrl` / `selectedProduct?.images[0]?.url`
- **Line 4309**: Model summary thumbnail (48px) — `model.previewUrl`
- **Line 4318**: Scene summary thumbnail (48px) — `pose.previewUrl`

### 3. `src/components/app/generate/WorkflowSettingsPanel.tsx`
- **Line 190**: Flat-lay product thumbnails (56px) — `up.image_url`

### 4. `src/components/app/SubmitToDiscoverModal.tsx`
- **Line 160**: Preview image — `imageUrl` (Supabase URL)
- **Line 220**: Product thumbnail (36px) — `productImageUrl`

## Medium Priority — Landing Page Images

### 5. `src/components/landing/StudioTeamSection.tsx`
- **Line 153**: Team member avatars (large cards) — `member.avatar`

### 6. `src/components/landing/BeforeAfterGallery.tsx`
- **Lines 6–11**: 12 `getLandingAssetUrl` images used as ShimmerImage `src` without optimization

### 7. `src/components/landing/CreativeDropsSection.tsx`
- **Lines 17–43**: 9 drop thumbnail URLs from `getLandingAssetUrl` without optimization

### 8. `src/components/landing/EnvironmentShowcaseSection.tsx`
- **Lines 12–43**: ~20 environment card images from `getLandingAssetUrl` and direct Supabase URLs without optimization

### 9. `src/components/app/workflowAnimationData.tsx`
- **Lines 8–47**: ~30 asset URLs from `getLandingAssetUrl` used as background/recipe images without optimization

## Low Priority — Admin Pages

### 10. `src/pages/AdminScenes.tsx`
- **Lines 663, 743**: Scene thumbnails (admin-only, low traffic)

---

## Pattern

Same as all previous batches:
```tsx
src={getOptimizedUrl(url, { quality: 60 })}
```

For landing data arrays (BeforeAfterGallery, CreativeDropsSection, EnvironmentShowcaseSection, workflowAnimationData), optimize at the data definition level using a helper like `const s = (path) => getOptimizedUrl(getLandingAssetUrl(path), { quality: 60 })`.

## Summary

| Category | Files | ~Image locations |
|---|---|---|
| App UI thumbnails | 4 files | ~7 locations |
| Landing page images | 5 files | ~70+ locations |
| Admin pages | 1 file | 2 locations |
| **Total** | **~10 files** | **~80 locations** |

