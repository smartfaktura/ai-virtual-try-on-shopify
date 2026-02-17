

## Add Shimmer Loading State to Lightbox Images

### Problem
When navigating images in the lightbox, they load progressively (part by part, top to bottom), which looks unpolished. The image should appear all at once with a smooth fade-in, matching the rest of the platform's loading behavior.

### Solution
Replace the plain `<img>` tag in the lightbox with the existing `ShimmerImage` component, and reset the loading state when navigating between images so each new image gets its own shimmer-to-fade transition.

### Changes

**File: `src/components/app/ImageLightbox.tsx`**

1. Import `ShimmerImage` from `@/components/ui/shimmer-image` and add a `useState` for tracking loaded state per image.

2. Replace the plain `<img>` element with `ShimmerImage`, adding a dark shimmer background that fits the lightbox aesthetic.

3. Use a `key={currentIndex}` on the image so React remounts it when navigating, resetting the loading state for each new image.

```tsx
// Before:
<img
  src={currentImage}
  alt={`Generated image ${currentIndex + 1}`}
  className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl shadow-black/40"
/>

// After:
<ShimmerImage
  key={currentIndex}
  src={currentImage}
  alt={`Generated image ${currentIndex + 1}`}
  className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl shadow-black/40"
  wrapperClassName="flex items-center justify-center max-w-full max-h-[80vh]"
/>
```

The ShimmerImage component handles:
- Displaying an animated shimmer gradient while the image loads
- A 300ms crossfade transition once the image is ready
- The `key={currentIndex}` ensures each navigation resets the loading state

### Result
- Images appear with a smooth shimmer animation instead of loading part-by-part
- Clean fade-in once fully loaded
- Consistent with the rest of the platform's image loading behavior
- No layout shift during loading

### Files Modified
- `src/components/app/ImageLightbox.tsx` -- use ShimmerImage with key-based remount
