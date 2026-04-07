

# Fix Lightbox & Add Download Buttons to Product Images Results

## Problems
1. **Lightbox has no download button** — `Step6Results` opens the lightbox without passing `onDownload`, so the action bar is empty
2. **White bar at top of lightbox** — the `ShimmerImage` wrapper uses `w-full h-full` which can cause the image container to stretch beyond the viewport, pushing a white gap at the top. The lightbox also needs `overflow-hidden` on the body to prevent page scroll bleed
3. **No per-image download on the grid** — users must open lightbox or use "Download All" to get a single image

## Changes

### File: `src/components/app/product-images/ProductImagesStep6Results.tsx`

1. **Wire `onDownload` into the lightbox** — import `saveOrShareImage` from `mobileImageSave.ts` and pass an `onDownload` handler that downloads the current image
2. **Add a download icon overlay to each grid card** — small `Download` icon button in the bottom-right corner of each thumbnail, visible on hover (always visible on mobile). Clicking it downloads that single image without opening the lightbox (use `e.stopPropagation()` to prevent lightbox open)

### File: `src/components/app/ImageLightbox.tsx`

3. **Fix the white bar / overflow issue** — add `useEffect` that sets `document.body.style.overflow = 'hidden'` when open, restores on close. This prevents the page behind from scrolling and creating visual artifacts
4. **Constrain the image wrapper** — add `overflow-hidden` to the main content container so the ShimmerImage wrapper doesn't bleed outside the max-height bounds

## What stays unchanged
- All existing lightbox props and action bar logic
- Download All zip functionality
- Grid layout and scene name labels

