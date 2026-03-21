

# Bolder Hero Title + Smaller Image with Carousel Indicator

## Changes

### File: `src/pages/TryShot.tsx`

**1. Bolder heading (line 143)**
Change `font-medium` → `font-semibold` on the `<h1>` so the full title feels heavier.

**2. Smaller showcase image (line 155)**
Reduce from `w-56 sm:w-64` → `w-44 sm:w-52` to make it less dominant.

**3. Add carousel dots below the image (after line 165)**
Add a row of 6 small dots below the image, highlighting the active one synced to `wordIndex`:

```tsx
<div className="flex justify-center gap-1.5 mt-3">
  {ROTATING_WORDS.map((_, i) => (
    <div
      key={i}
      className={cn(
        'w-1.5 h-1.5 rounded-full transition-all duration-500',
        i === wordIndex ? 'bg-primary w-4' : 'bg-border'
      )}
    />
  ))}
</div>
```

The active dot stretches wider (`w-4`) and turns dark navy, while inactive dots stay as small circles — a clear indicator that images are rotating.

## Summary
- 1 file, 3 changes: bolder heading, smaller image, animated dot indicator

