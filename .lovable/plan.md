

## Improve Product Switcher Styling + Fix Image Flash on Switch

### Problem 1: Switcher pills look awkward
The "Crop Top", "Ring", "Headphones" pills sit below the upload card with plain styling. They need to feel more polished and clearly interactive.

### Problem 2: Images flash/shimmer every time you switch products
When switching products, all output images re-mount and show shimmer placeholders even if they were already loaded. This is because the `key` changes and React unmounts/remounts all `ShimmerImage` components.

### Changes in `src/components/landing/HeroSection.tsx`

**A. Preload all scenes on hover (not just on click)**
- Add `onMouseEnter={() => preloadScene(i)}` to each switcher pill so images start loading before the user clicks.

**B. Prevent flash by pre-rendering all scenes**
- Instead of only rendering `current.outputs`, render ALL showcases but hide inactive ones with `display: none`. This keeps images mounted and loaded in the DOM, so switching is instant with no shimmer flash.
- The product card does the same — render all 3 product images stacked, show only the active one.

**C. Improve pill styling**
- Desktop: Use slightly larger pills with a subtle icon or product thumbnail dot before the label. Add a smooth underline/scale indicator for the active state instead of just color fill.
- Style: `px-4 py-1.5 rounded-full text-xs font-semibold` with a soft shadow on active, and a gentle scale transform (`scale-105`) for the active pill. Inactive pills get `hover:bg-accent/50`.
- Mobile: Same approach, slightly smaller (`px-3 py-1 text-[10px]`).

### Implementation Detail

```tsx
{/* Render all scenes, only show active */}
{showcases.map((showcase, sceneIdx) => (
  <div
    key={sceneIdx}
    className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory"
    style={{
      display: sceneIdx === activeScene ? 'flex' : 'none',
      scrollbarWidth: 'none',
    }}
    ref={sceneIdx === activeScene ? scrollRef : undefined}
  >
    {showcase.outputs.map((output, idx) => (
      <div key={output.label} className="flex-shrink-0 w-[180px] snap-start group">
        <ShimmerImage ... />
      </div>
    ))}
  </div>
))}
```

For the product image card, same pattern — stack all 3 product images, toggle visibility.

### Files to modify
- `src/components/landing/HeroSection.tsx`

