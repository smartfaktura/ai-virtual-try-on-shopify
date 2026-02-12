
## Add Compression to Remaining Dashboard Images

Two small spots on the dashboard are still loading full-resolution images for tiny 40x40px thumbnails.

### Changes

**1. `src/pages/Dashboard.tsx` (line 303)**
- The recent jobs table shows 40x40px product thumbnails at full quality
- Apply `getOptimizedUrl(url, { width: 80, quality: 50 })` -- 80px is 2x the display size for retina screens, 50% quality is fine for this size

**2. `src/components/app/RecentProductsList.tsx` (line 22)**
- Same situation: 40x40px product thumbnails loading full-res images
- Apply `getOptimizedUrl(url, { width: 80, quality: 50 })`

### Summary of Where Compression Now Applies

| Location | Size | Optimization |
|---|---|---|
| Dashboard - Recent Creations gallery | 180px cards | quality: 60 (already done) |
| Dashboard - Recent Jobs table | 40px thumbnails | width: 80, quality: 50 (new) |
| Recent Products List | 40px thumbnails | width: 80, quality: 50 (new) |
| Library grid | cards | quality: 60 (already done) |
| Discover grid | cards | quality: 60 (already done) |
| Freestyle - natural layout | large | quality: 75 (already done) |
| Freestyle - masonry grid | cards | quality: 60 (already done) |
| Lightbox - main image | full screen | original URL, 100% quality (already done) |
| Lightbox - thumbnail strip | 56px | width: 100, quality: 50 (already done) |

### Technical Details
- Import `getOptimizedUrl` from `@/lib/imageOptimization` into both files
- Wrap the `src` attribute with the helper function
- No database or backend changes needed
