

# Final Remaining Unoptimized Images

After a careful audit of every `getLandingAssetUrl`, `image_url`, `previewUrl`, and `poster` usage, here are the last unoptimized Supabase storage image locations.

---

## Files to update

### 1. `src/pages/Dashboard.tsx`
- **Lines 538, 545, 555, 565, 577**: MetricCard `tooltip.avatar` — 5 raw `getLandingAssetUrl('team/...')` calls passed as avatar props without optimization

### 2. `src/components/app/EmptyStateCard.tsx`
- **Lines 6–8**: 3 collage images (`imgFashion`, `imgSkincare`, `imgFood`) — raw `getLandingAssetUrl` at 56px thumbnails

### 3. `src/components/app/TryOnUploadGuide.tsx`
- **Lines 7–15**: 6 example images (good + bad) — raw `getLandingAssetUrl` rendered in small grid tiles

### 4. `src/components/app/TemplatePreviewCard.tsx`
- **Lines 7–24**: 17 template images — raw `getLandingAssetUrl` rendered in aspect-square cards

### 5. `src/components/landing/ModelShowcaseSection.tsx`
- **Line 11**: Helper `m()` uses raw `getLandingAssetUrl` — ~30 model images in marquee without optimization

### 6. `src/components/landing/ProductCategoryShowcase.tsx`
- **Line 67**: Helper `s()` uses raw `getLandingAssetUrl` — ~16 showcase images. Note: the `ShimmerImage` render on line 51 wraps with `getOptimizedUrl`, but the data definition doesn't, so it's double-processing. Should optimize at data level and remove the render-level wrap, or just keep render-level (already done). **Actually already optimized at render** — skip this file.

### 7. `src/pages/VideoHub.tsx`
- **Line 76**: `video.source_image_url` — card thumbnail without optimization

### 8. `src/components/app/video/VideoDetailModal.tsx`
- **Line 112**: `video.source_image_url` — large preview (skip — this is a full-size view)

### 9. `src/components/app/DropCard.tsx`
- **Line 222**: `p.image_url` (28px product thumbnails) — raw without optimization

### 10. `src/components/app/ShopifyImportTab.tsx`
- **Line 481**: `p.image_url` (32px thumbnails) — raw without optimization

### 11. `src/components/app/UploadSourceCard.tsx`
- **Line 116**: `scratchUpload.previewUrl` — this is a user-uploaded blob URL, not Supabase. **Skip.**

### 12. `src/components/app/generate/WorkflowSettingsPanel.tsx`
- **Line 210**: Product source thumbnail (64px) — raw `scratchUpload?.previewUrl` or `selectedProduct?.images[0]?.url` without optimization

### 13. `src/pages/Team.tsx`
- **Line 104**: `poster={member.avatar}` — video poster without optimization

### 14. `src/components/landing/TeamVideoInterlude.tsx`
- **Line 49**: `poster={member.avatar}` — video poster without optimization

### 15. `src/components/landing/TeamAvatarHoverCard.tsx`
- **Line 54**: `poster={member.avatar}` — video poster without optimization

### 16. `src/components/landing/StudioTeamSection.tsx`
- **Line 144**: `poster={member.avatar}` — video poster without optimization

---

## Filtered list (excluding already-optimized, blob URLs, and full-size views)

| # | File | Locations | Type |
|---|---|---|---|
| 1 | `Dashboard.tsx` | 5 | MetricCard tooltip avatars |
| 2 | `EmptyStateCard.tsx` | 3 | Collage thumbnails |
| 3 | `TryOnUploadGuide.tsx` | 6 | Example grid images |
| 4 | `TemplatePreviewCard.tsx` | 17 | Template card images |
| 5 | `ModelShowcaseSection.tsx` | ~30 | Marquee model images |
| 6 | `VideoHub.tsx` | 1 | Video source thumbnail |
| 7 | `DropCard.tsx` | 1 | Product mini-thumbnails |
| 8 | `ShopifyImportTab.tsx` | 1 | Import table thumbnails |
| 9 | `WorkflowSettingsPanel.tsx` | 1 | Source product thumbnail |
| 10 | `Team.tsx` | 1 | Video poster |
| 11 | `TeamVideoInterlude.tsx` | 1 | Video poster |
| 12 | `TeamAvatarHoverCard.tsx` | 1 | Video poster |
| 13 | `StudioTeamSection.tsx` | 1 | Video poster |
| **Total** | **13 files** | **~70 locations** | |

## Pattern

Same as all previous batches:
```tsx
// For data-level helpers
const s = (path: string) => getOptimizedUrl(getLandingAssetUrl(path), { quality: 60 });

// For inline usage
src={getOptimizedUrl(url, { quality: 60 })}

// For video posters
poster={getOptimizedUrl(member.avatar, { quality: 60 })}
```

Quality-only compression. No width constraints.

