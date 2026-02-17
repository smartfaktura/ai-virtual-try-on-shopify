

## Improve Recent Creations Loading Experience in Workflows

### Problems Identified

1. **No loading state** -- Thumbnail cards show a static grey `ImageIcon` placeholder while the signed URL is being fetched. No shimmer animation, no visual indication that something is loading. Looks broken.
2. **No error state** -- If the signed URL fails or the image itself fails to load, the card stays stuck on the placeholder icon forever. No retry, no error feedback.
3. **Slow image loading** -- Each thumbnail fetches its signed URL individually (sequential `toSignedUrl` calls). With 5 cards, that's 5 separate API calls instead of 1 batched call.
4. **No image optimization** -- Raw full-resolution signed URLs are used directly. The thumbnails display at 140x140px but load the full image.

### Solution

#### 1. Add shimmer loading state to ThumbnailCard
Replace the static `ImageIcon` placeholder with the existing `ShimmerImage` component (already used across the app for consistent loading UX). This gives:
- Animated shimmer gradient while signed URL is being fetched
- Smooth 300ms crossfade when image loads
- Built-in error handling

#### 2. Add error state with fallback icon
When the image fails to load (broken URL, 403, etc.), show a subtle error state with the `ImageIcon` and muted styling instead of a broken image or infinite shimmer.

#### 3. Batch signed URL fetching
Move from individual `toSignedUrl()` calls per card to a single `toSignedUrls()` batch call at the `WorkflowRecentRow` level. This:
- Reduces API calls from N to 1 per bucket
- Speeds up the entire row loading significantly
- Already exists in `src/lib/signedUrl.ts` as `toSignedUrls`

#### 4. Apply image optimization
Use `getOptimizedUrl` with `{ quality: 60 }` on the signed URLs for faster delivery at appropriate quality.

### Technical Changes

**`src/components/app/WorkflowRecentRow.tsx`**

1. **Batch URL signing at row level**: Add a `useEffect` in `WorkflowRecentRow` that collects all raw image URLs from jobs, calls `toSignedUrls()` once, and passes resolved URLs down to each `ThumbnailCard`.

2. **Replace static placeholder with ShimmerImage**: In `ThumbnailCard`, use `ShimmerImage` with `aspectRatio="1/1"` instead of the manual `imgSrc ? <img> : <ImageIcon>` pattern.

3. **Add error fallback**: When `ShimmerImage` triggers `onError`, show a muted `ImageIcon` with "Failed to load" text.

4. **Apply optimization**: Wrap signed URLs through `getOptimizedUrl({ quality: 60 })` before passing to `ShimmerImage`.

### Files to modify
- `src/components/app/WorkflowRecentRow.tsx` -- All changes are in this single file

### What this fixes
- Shimmer animation during URL signing and image loading (consistent with rest of app)
- Graceful error state if image fails
- Faster loading via batched signed URL calls (1 API call instead of 5)
- Smaller image payloads via quality optimization
