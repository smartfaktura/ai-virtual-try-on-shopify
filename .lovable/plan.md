

# Optimize All Unoptimized Supabase Image Thumbnails

All changes use quality-only compression (`{ quality: 60 }`) via the existing `getOptimizedUrl` utility — no width constraints, matching project conventions to avoid zoom/crop distortion.

**Note**: Files like `ManualProductTab.tsx` and `UploadSourceCard.tsx` use local blob preview URLs (from file uploads), which cannot be optimized via Supabase transform — these are excluded.

---

## Files to update

### 1. `src/components/app/TryOnConfirmModal.tsx`
- **Line 84**: Model avatar (40×40) — `allModels[0].previewUrl` → wrap with `getOptimizedUrl(..., { quality: 60 })`
- **Line 95**: Model avatars (32×32) — `m.previewUrl` → same
- **Line 109**: Pose thumbnail (40×40) — `pose.previewUrl` → same

### 2. `src/components/app/TryOnPreview.tsx`
- **Line 116**: Product thumbnails (48–64px) — `p.images[0].url` → wrap with `getOptimizedUrl(..., { quality: 60 })`

### 3. `src/components/app/ModelSelectorCard.tsx`
- **Line 22**: Model card (3:4 grid) — `model.previewUrl` in ShimmerImage → wrap with `getOptimizedUrl(..., { quality: 60 })`

### 4. `src/components/app/GenerateConfirmModal.tsx`
- **Line 69**: Product image (56×56) — `selectedSourceImages[0]?.url || product.images[0]?.url` → wrap with `getOptimizedUrl`
- **Line 81**: Source reference thumbnails (32×32) — `img.url` → wrap with `getOptimizedUrl(..., { quality: 60 })`
- **Line 94**: Template image (40×40) — `templateImage` → wrap with `getOptimizedUrl(..., { quality: 60 })`

### 5. `src/components/app/FramingSelector.tsx`
- **Lines 33, 111**: Framing option thumbnails (40–56px) — `opt.previewUrl` → wrap with `getOptimizedUrl(..., { quality: 60 })`

### 6. `src/components/app/FramingSelectorChip.tsx`
- **Lines 14, 83**: Framing chip thumbnails (16–32px) — `option.previewUrl` / `opt.previewUrl` → wrap with `getOptimizedUrl(..., { quality: 60 })`

### 7. `src/components/app/generate/TryOnSettingsPanel.tsx`
- **Line 98**: Model avatar (32×32) — `m.previewUrl` → wrap
- **Line 115**: Pose avatar (32×32) — `p.previewUrl` → wrap

### 8. `src/components/app/generate/UpscaleSettingsPanel.tsx`
- **Line 53**: Source image (64×64) — `selectedProduct?.images[0]?.url` → wrap with `getOptimizedUrl`

### 9. `src/components/app/PopularCombinations.tsx`
- **Line 27**: Model thumbnail (48×48) — `combo.model.previewUrl` → wrap
- **Line 28**: Pose thumbnail (32×32) — `combo.pose.previewUrl` → wrap

### 10. `src/components/app/video/LibraryPickerModal.tsx`
- **Line 64**: Library grid thumbnails — `item.imageUrl` → wrap with `getOptimizedUrl(..., { quality: 60 })`

### 11. `src/pages/Generate.tsx`
- **Line 2814**: Sample product image (80×80) — `sampleProduct.images[0].url` → wrap
- **Line 2871**: Non-tryon sample product (80×80) — `nonTryOnSample.images[0].url` → wrap
- **Line 4330**: Scene summary thumbnails (48×48) — `v.preview_url` → wrap

### 12. `src/components/app/JobDetailModal.tsx`
- **Line 148**: Generated result grid — `result.imageUrl` → wrap with `getOptimizedUrl(..., { quality: 60 })`

---

## Summary

| Files | Thumbnail count | Pattern |
|---|---|---|
| 12 files | ~20 image locations | Add `getOptimizedUrl(url, { quality: 60 })` |

Each file just needs the import added and raw URLs wrapped. No width constraints, no layout changes, no risk of zoom distortion.

