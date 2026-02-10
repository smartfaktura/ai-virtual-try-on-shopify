

## Fix Generating Card UX Issues

### Three Problems

1. **Generating card ignores selected aspect ratio**: `GeneratingCard` always renders with `min-h-[300px]` regardless of the user's chosen ratio (1:1, 3:4, etc.). When user picks 1:1, the placeholder appears as a tall rectangle instead of a square.

2. **White flash between generating and final image**: When generation completes, the generating card disappears. The new `ImageCard` renders with `opacity-0` and only fades in after `onLoad` fires on the `<img>`. During that gap (could be seconds for large images), the user sees an empty white card -- the "laggy white screen."

3. **Layout shift on swap**: The generating card and the final image card may have different dimensions, causing a jarring layout jump.

### Solution

**A. Pass aspect ratio to GeneratingCard and use it for sizing**

Pass `aspectRatio` from `Freestyle.tsx` through `FreestyleGallery` to `GeneratingCard`. Use CSS `aspect-ratio` on the card instead of `min-h-[300px]` so the placeholder matches the expected output dimensions.

**B. Eliminate white flash with eager loading + background color**

- Change `ImageCard` image loading from `lazy` to `eager` for newly generated images
- Add a `bg-muted` background to the image card container so it shows a neutral shimmer instead of white while the image loads
- Keep the opacity transition but ensure the container itself has a visible background

**C. Smooth aspect-ratio-aware transition**

Apply `aspect-ratio` CSS to image cards as well (based on their stored `aspectRatio` metadata), so the container is properly sized before the image loads.

### Files to Modify

| File | Change |
|------|--------|
| `src/components/app/freestyle/FreestyleGallery.tsx` | Add `aspectRatio` prop to `GeneratingCard`; use CSS `aspect-ratio` instead of `min-h-[300px]`; add `bg-muted` and shimmer to `ImageCard` container; use `loading="eager"` |
| `src/pages/Freestyle.tsx` | Pass `aspectRatio` to the gallery as `generatingAspectRatio` |

### Technical Details

**Aspect ratio mapping utility:**

```tsx
const RATIO_MAP: Record<string, string> = {
  '1:1': '1/1',
  '3:4': '3/4',
  '4:5': '4/5',
  '9:16': '9/16',
  '16:9': '16/9',
};
```

**GeneratingCard changes:**

```tsx
function GeneratingCard({ progress, aspectRatio, className }) {
  const cssRatio = RATIO_MAP[aspectRatio || '1:1'] || '1/1';
  return (
    <div
      className={cn('rounded-xl overflow-hidden ...', className)}
      style={{ aspectRatio: cssRatio }}
    >
      {/* avatar, status, progress bar */}
    </div>
  );
}
```

**ImageCard container -- prevent white flash:**

```tsx
<div
  className={cn(
    'group relative overflow-hidden rounded-xl shadow-md cursor-pointer',
    'bg-muted animate-shimmer bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%]',
    className,
  )}
  style={{ aspectRatio: RATIO_MAP[img.aspectRatio || '1:1'] || '1/1' }}
>
  <img
    className={cn(
      'w-full h-full object-cover transition-opacity duration-700',
      loaded ? 'opacity-100' : 'opacity-0',
    )}
    loading="eager"
    onLoad={() => setLoaded(true)}
  />
</div>
```

This means:
- Before the image loads, the card shows a shimmer at the correct size
- The image fades in smoothly over 700ms
- No white gap, no layout shift, correct dimensions throughout

**Freestyle.tsx -- pass aspect ratio:**

```tsx
<FreestyleGallery
  ...
  generatingAspectRatio={aspectRatio}
/>
```

