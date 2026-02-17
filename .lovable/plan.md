

## Fix Slow Workflow Preview Loading

### Problem
Each workflow card uses `WorkflowAnimatedThumbnail` which has a `usePreloadImages` hook that waits for ALL images (background + floating element images like product chips, model portraits, scene thumbnails) to fully download before rendering anything. With 4-8 full-resolution images per card across 5 workflows, this means ~25-30 images must finish loading before any visual appears -- causing the blank grey area you see for over a minute.

### Solution: Show Background Immediately, Lazy-Load Overlays

Instead of blocking everything until all images load, split the loading into two tiers:

1. **Background image renders immediately** -- no preloading gate. The large hero image appears right away with a shimmer-to-fade transition.
2. **Floating elements (product chips, model circles, badges) only appear once their small images are ready** -- these are tiny thumbnails and load fast, but even if they're slow, the card already looks complete with just the background.
3. **Use optimized thumbnail URLs** for the small overlay images (product/model/scene chips are only 56-60px wide, no need for full-res).

### Changes

**`src/components/app/WorkflowAnimatedThumbnail.tsx`**
- Remove the global `usePreloadImages` gate that blocks the entire component
- Show the background `img` immediately (it already has `loading="eager"`)
- Add a separate preload for just the small element images (product/model/scene chips)
- Only delay the floating overlay elements until their small images are ready
- Use `getOptimizedUrl` with `width: 120` for element images (they display at 56-60px, so 120px/2x is plenty)

**`src/components/app/workflowAnimationData.tsx`**
- Wrap element image URLs with `getOptimizedUrl({ width: 120 })` so the chip thumbnails load as small optimized images instead of full-resolution originals

**`src/pages/Workflows.tsx`**
- Add `staleTime: 5 * 60 * 1000` to the workflows query to avoid re-fetching on every page visit

### Technical Details

Current flow:
```
Page load -> Fetch workflows -> Wait for ALL images -> Show cards
```

New flow:
```
Page load -> Fetch workflows -> Show cards with backgrounds immediately
                              -> Preload small chip images in parallel
                              -> Fade in floating overlays when ready
```

The key change in `WorkflowAnimatedThumbnail.tsx` is splitting the preloader:

- Background: rendered directly with no gate, uses a CSS fade-in transition
- Element images: preloaded separately via the existing `usePreloadImages` hook, but only gating the overlay layer (not the whole component)
- Carousel mode backgrounds: shown immediately (first image renders, others load behind it)

This means users will see the workflow preview images within 1-2 seconds instead of waiting 30-60+ seconds for every single asset to download.

