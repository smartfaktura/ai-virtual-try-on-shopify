

## Fix Zoomed-In Images in Freestyle Showcase

**Problem**: The `getOptimizedUrl` width parameter forces server-side resize, so images served at `width: 40` (chips) and `width: 400` (results) appear zoomed/cropped when displayed with `object-cover`.

**Fix**: Remove `width` constraints and use quality-only optimization. This preserves original framing while still reducing file size.

**File**: `src/components/landing/FreestyleShowcaseSection.tsx`

### Changes

1. **Model avatars** (lines 17-19): Remove `width: 40`, keep `quality: 50` only — these are tiny circles so quality compression alone is enough.

2. **Chip thumbnails** (lines 28, 44): Remove `width: 40`, keep `quality: 50` only.

3. **Result cards** (lines 50-52): Remove `width: 400`, keep `quality: 60` only — these are the most visible and most affected by the zoom.

All calls become e.g. `getOptimizedUrl(url, { quality: 50 })` instead of `getOptimizedUrl(url, { width: 40, quality: 50 })`.

