

# Add Dynamic Aesthetic Color Badge to Scene Cards

## What it does
Add a badge on the **bottom-left** of scene cards that have the `aestheticColor` trigger block — showing the scene's actual curator-picked colors (from `suggestedColors`) as mini swatches. If no curator picks exist, show 3 generic warm-tone dots as fallback. This mirrors the background palette badge (bottom-right) but with real data.

## Implementation — `ProductImagesStep2Scenes.tsx`

### In the `SceneCard` component (line 178):

1. Add detection: `const hasAestheticColor = scene.triggerBlocks?.includes('aestheticColor');`

2. After the `hasBackground` badge block (line 208), add a new badge at `bottom-1.5 left-1.5`:

```tsx
{hasAestheticColor && (
  <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-white/20 shadow-sm rounded-full px-1.5 py-1">
    <Paintbrush className="w-2.5 h-2.5 text-muted-foreground" />
    {scene.suggestedColors && scene.suggestedColors.length > 0
      ? scene.suggestedColors.slice(0, 4).map((c, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full border border-white/40" style={{ backgroundColor: c.hex }} />
        ))
      : <>
          <div className="w-2.5 h-2.5 rounded-full bg-[#5F8A8B]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#C4835B]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#8B9E7E]" />
        </>
    }
  </div>
)}
```

3. Add `Paintbrush` to the lucide-react import.

### Result
- Scenes with curator picks show the **actual recommended colors** as dots — e.g. if admin set teal + terracotta + sage, those exact colors appear
- Scenes without curator picks show 3 generic warm-tone dots as fallback
- The `Paintbrush` icon differentiates this from the background palette badge (which has no icon)
- Both badges can coexist: background on bottom-right, aesthetic color on bottom-left

### File changed
- `src/components/app/product-images/ProductImagesStep2Scenes.tsx` — ~12 lines added

