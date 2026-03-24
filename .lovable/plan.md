

# Fix Preset Carousel Spacing & Alignment

## Issues
1. **Spacing**: The presets carousel doesn't have proper spacing — it's crammed against the prompt bar with no breathing room
2. **Width mismatch**: The presets container uses `px-4` on mobile but the prompt bar uses `px-0` — they don't align. On desktop, both use `lg:max-w-2xl lg:mx-auto` but the outer padding differs (`sm:pr-16 lg:pr-20` on prompt bar vs just `sm:px-8` on presets)
3. **Scene images**: The images ARE correct from `mockTryOnPoses` — they show the actual scene environments with models. The `previewUrl` is the same image shown in the scene picker library. No image source change needed.

## Changes

### `src/pages/Freestyle.tsx` (lines 951-966)

Fix the presets wrapper to use **identical** padding/width classes as the prompt bar container (line 975):

```
// Before (presets wrapper)
<div className={cn("sm:px-8 sm:pr-16 lg:pr-20 pb-3", "px-4")}>

// After — match prompt bar exactly
<div className={cn("px-0 sm:px-8 sm:pr-16 lg:pr-20 pb-4")}>
```

Also increase bottom padding from `pb-3` to `pb-4` for breathing room between presets and prompt bar.

Remove the `min-h-8` from the spacer — just use `flex-1` so it naturally fills available space without forcing a minimum that eats into the preset area.

### Files
- `src/pages/Freestyle.tsx` — fix padding to match prompt bar, improve spacing

