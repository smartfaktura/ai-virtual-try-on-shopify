

# Remove Hover Label Badge from Library Image Cards

## Problem
On hover, Library cards show a top-left badge like "Picture Perspectives — Right Side" or "Freestyle". This is unnecessary visual noise.

## Change

### `src/components/app/LibraryImageCard.tsx` (lines 125-136)

Remove the entire top badge section from the hover overlay. Keep only the bottom row (date, delete, download).

Replace lines 125-136:
```tsx
{/* Top: badge */}
<div className="flex justify-between items-start">
  <span className="text-[10px] px-2 py-0.5 rounded-md font-medium backdrop-blur-sm flex items-center gap-1 bg-black/40 text-white">
    {item.quality?.startsWith('upscaled_') ? (
      <><Sparkles className="w-3 h-3" /> Enhanced</>
    ) : item.source === 'freestyle' ? (
      <><Sparkles className="w-3 h-3" /> Freestyle</>
    ) : (
      <><Camera className="w-3 h-3" /> {item.label}</>
    )}
  </span>
</div>
```

With just an empty spacer div to keep the `justify-between` layout pushing the bottom row down:
```tsx
<div />
```

One file, ~10 lines removed.

