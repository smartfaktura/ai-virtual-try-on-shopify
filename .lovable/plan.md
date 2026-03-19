

# Fix Slow Loading in Recent Creations Gallery

## Problem
The `RecentCreationsGallery` component calls `toSignedUrl()` **sequentially inside loops** (lines 96 and 130). Each call is an individual network request to create a signed URL. With 5 jobs × multiple result images + 5 freestyle images, this creates a waterfall of 10-20+ sequential API calls before any image can render.

Additionally, no `width` parameter is passed to `getOptimizedUrl` — only `quality: 60` — so the browser still downloads near-full-size images for 180px-wide thumbnails.

## Root Cause
```
// Current: sequential await inside for-loop
for (const job of jobs) {
  for (const r of results) {
    const signedUrl = await toSignedUrl(url);  // ← blocks next iteration
  }
}
```

The batch helper `toSignedUrls()` already exists and groups URLs by bucket into a single API call per bucket, but it's not being used here.

## Changes — `src/components/app/RecentCreationsGallery.tsx`

### 1. Collect all URLs first, then batch-sign
Restructure `queryFn` to:
1. Build the items array with raw URLs (no signing)
2. Collect all URLs into a flat array
3. Call `toSignedUrls(allUrls)` once at the end
4. Map signed URLs back onto items

This replaces 10-20 sequential network calls with 1-2 batch calls (one per private bucket).

### 2. Add `width: 400` to `getOptimizedUrl`
On line 273, add a width parameter for the thumbnail render:
```
getOptimizedUrl(item.imageUrl, { width: 400, quality: 60 })
```
Cards are 180px CSS but ~360px on retina — 400px is sufficient.

## Expected Impact
- **Network calls**: ~15 sequential → 1-2 batch (major latency reduction)
- **Image payload**: ~60-80% smaller per thumbnail with width constraint

