

## Fix lightbox cropping image bottom on results page

### Problem
On `/app/generate/product-images` results, opening the lightbox shows the image cropped (legs cut off) inside a square frame, even though the actual generated image is a full-body portrait.

### Root cause
`ImageLightbox` wraps the `<img>` in `ShimmerImage`, whose wrapper is `relative overflow-hidden w-full h-full`. Inside the lightbox the parent is a flex column with only `max-w-[90vw] max-h-[85vh]` (no intrinsic width/height), so the wrapper sizes to its content but the `overflow-hidden` + wrapper geometry clips portrait images that exceed the wrapper's resolved box. The `<img>` itself has the right `max-h-[75vh] object-contain` rules, but it's being clipped by the shimmer wrapper, not by the image element.

### Fix
In `src/components/app/ImageLightbox.tsx`, replace the `ShimmerImage` usage with a plain `<img>` for the lightbox view. The lightbox is fullscreen, modal, and only shows one image at a time — the shimmer placeholder adds no UX value and its wrapper introduces the clipping bug.

Replacement (around lines 133–145):
```tsx
<img
  key={currentIndex}
  src={currentImage}
  alt={`Generated image ${currentIndex + 1}`}
  className={cn(
    'max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl shadow-black/40',
    isMobile ? 'max-h-[60vh]' : 'max-h-[75vh]'
  )}
/>
```

Also remove the now-unused `ShimmerImage` import.

### Why this is safe
- Lightbox is a one-image-at-a-time modal — no grid shimmer needed.
- Image already exists in the user's session (just clicked from grid where it loaded), so flash-of-empty is a non-issue.
- All other consumers of `ShimmerImage` (grids, library, results thumbnails) are unaffected.

### Validation
1. Open `/app/generate/product-images` → run a generation → click any portrait result.
2. Lightbox should display the full image (head to feet) within `max-h-75vh`, never cropped.
3. Test with both portrait (4:5) and landscape (16:9) outputs.
4. Navigation arrows still work; counter still shows `N / total`.

