

## Fix Product Category Showcase Image Stacking

### Problem
The "All products look better here" section shows blank cards because of a CSS stacking conflict with the `ShimmerImage` component. The images are loading fine (all return HTTP 200), but they aren't visually displayed.

The `ProductCategoryShowcase` stacks multiple images absolutely inside each card, toggling opacity to crossfade between them. However, `ShimmerImage` wraps each `<img>` in an extra `<div class="relative overflow-hidden w-full h-full">`. This means:

- The `absolute inset-0` class ends up on the `<img>` inside the wrapper, positioning it relative to the wrapper -- not the card
- The wrapper divs themselves are in normal document flow and not absolutely positioned, so they don't stack properly
- ShimmerImage also has its own internal `opacity-0 / opacity-100` logic that conflicts with the external opacity style used for crossfading

### Solution
Use the `wrapperClassName` prop on `ShimmerImage` to make the wrapper itself absolutely positioned, and move the opacity/transition styles to the wrapper level so both the shimmer placeholder and the image fade together correctly.

### Technical Changes

**File: `src/components/landing/ProductCategoryShowcase.tsx`** (lines 47-59)

Replace the current ShimmerImage usage with wrapper-level absolute positioning:

```tsx
{images.map((img, i) => (
  <ShimmerImage
    key={i}
    src={img}
    alt={`${label} AI-generated product shot`}
    decoding="async"
    wrapperClassName="absolute inset-0"
    wrapperStyle={{
      opacity: i === currentIndex ? 1 : 0,
      transition: 'opacity 1.2s ease-in-out',
    }}
    className="w-full h-full object-cover"
  />
))}
```

**File: `src/components/ui/shimmer-image.tsx`**

Add `wrapperStyle` to the props interface so the parent can pass transition styles to the wrapper div:

```tsx
interface ShimmerImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: string;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;  // NEW
}
```

Then apply it to the wrapper div:

```tsx
<div
  className={cn('relative overflow-hidden w-full h-full', wrapperClassName)}
  style={{
    ...(aspectRatio && !loaded ? { aspectRatio } : undefined),
    ...wrapperStyle,
  }}
>
```

This ensures each ShimmerImage wrapper is absolutely positioned inside the card, stacking correctly, and the crossfade opacity is controlled at the wrapper level rather than conflicting with ShimmerImage's internal load-state opacity.
