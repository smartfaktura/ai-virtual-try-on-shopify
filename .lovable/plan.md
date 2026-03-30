

# Fix Stalled Crossfade Transitions

## Root Cause
`onTransitionEnd` is passed as a prop to `ShimmerImage`, which spreads it onto the inner `<img>` tag via `...rest`. But the opacity transition (`transition-opacity duration-500`) is applied to the **wrapper div** via `wrapperClassName`. The `<img>` never transitions opacity at the wrapper level, so `onTransitionEnd` never fires. The cycle stalls after the first crossfade.

## Fix — `src/components/landing/ProductCategoryShowcase.tsx`

Wrap the incoming `ShimmerImage` in a plain `<div>` that owns both the transition classes and the `onTransitionEnd` handler:

```tsx
{incomingIndex !== null && (
  <div
    className="absolute inset-0 transition-opacity duration-500"
    style={{ zIndex: 2, opacity: fadeIn ? 1 : 0 }}
    onTransitionEnd={handleTransitionEnd}
  >
    <ShimmerImage
      src={images[incomingIndex]}
      alt={`${label} AI-generated product shot`}
      loading="eager"
      decoding="async"
      wrapperClassName="absolute inset-0"
      className="w-full h-full object-cover"
    />
  </div>
)}
```

This ensures:
- The opacity transition lives on a real DOM element we control
- `onTransitionEnd` fires reliably when the 500ms fade completes
- `handleTransitionEnd` swaps `displayIndex`, resets state, and the next cycle begins

Single file change, ~10 lines replaced.

