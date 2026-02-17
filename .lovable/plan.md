

## Fix: Workflow Thumbnail Image Loading States

### Problem
The Workflows page has multiple animated thumbnails, each loading several images (backgrounds, product chips, model avatars). These plain `<img>` tags load progressively, causing visual glitches and a broken-looking preview while images stream in.

### Solution
Add image preloading to `WorkflowAnimatedThumbnail` so the entire thumbnail stays in a shimmer loading state until all its images (background + element thumbnails) are ready. Once loaded, the component fades in cleanly.

### Changes

**File: `src/components/app/WorkflowAnimatedThumbnail.tsx`**

1. Create a `usePreloadImages` hook inside the file that collects all image URLs from the scene (background, backgrounds array, and element images) and preloads them via `new Image()`.

2. While images are loading, render a shimmer placeholder (`bg-muted` with `animate-shimmer`) matching the card dimensions.

3. Once all images are loaded, fade in the full animated thumbnail with a 300ms transition.

4. Apply the same pattern to both recipe mode and carousel mode renders.

### Technical Details

```text
Before:
  Component mounts -> raw <img> tags start loading -> progressive render -> visual glitches

After:
  Component mounts -> shimmer placeholder shown -> all images preloaded in background
  -> once ready, fade in complete thumbnail (no progressive loading visible)
```

The preloader collects URLs from:
- `scene.background` (main background)
- `scene.backgrounds[]` (carousel backgrounds)
- `scene.elements[].image` (product/model/scene chip thumbnails)

A simple `Promise.all` with `new Image()` handles preloading. Failed images are treated as loaded (graceful degradation) so the component still appears.

### Files Modified
- `src/components/app/WorkflowAnimatedThumbnail.tsx` -- add image preloading with shimmer fallback

