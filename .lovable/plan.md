

# Add Frosted Glass Background Indicator to Scene Cards

## What
Add a small frosted-glass pill at the bottom-right of scene card images showing 3 color dots + a gradient dot — only on scenes whose `promptTemplate` contains `{{background}}`. Apple-inspired material design.

## Changes

**`src/components/app/product-images/ProductImagesStep2Scenes.tsx`** — `SceneCard` component (inside the `aspect-[3/4]` div, after the selected checkmark):

```tsx
const hasBackground = scene.promptTemplate?.includes('{{background}}');

{hasBackground && (
  <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-white/20 shadow-sm rounded-full px-1.5 py-1">
    <div className="w-2.5 h-2.5 rounded-full bg-white border border-gray-200" />
    <div className="w-2.5 h-2.5 rounded-full bg-[#E8EDE6]" />
    <div className="w-2.5 h-2.5 rounded-full bg-[#F8ECE8]" />
    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-blue-200 to-pink-200 border border-white/30" />
  </div>
)}
```

One file, ~10 lines added. No other changes needed.

