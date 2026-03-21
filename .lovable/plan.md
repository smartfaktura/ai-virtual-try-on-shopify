

# TryShot Mobile Hero Improvements

## Changes

### File: `src/pages/TryShot.tsx`

**1. Bolder heading on mobile (line 144)**
Change `font-semibold` → `font-bold` on the `<h1>` for more impact on small screens.

**2. Remove image rotation (line 156)**
Remove `rotate-[-2deg]` from the image container — the card will sit straight.

**3. Replace step-based progress bar with a smooth auto-filling timer bar**
Instead of the current bar that jumps by word index, implement a bar that smoothly fills from 0% to 100% over the duration of each word interval (~2.5s), then resets when the word changes. This gives a clear visual cue that the next image is coming.

Change the progress bar (lines 167-172) to use a CSS animation approach:
- Add a `key={wordIndex}` to force re-render/restart animation on each word change
- Use inline style with `transition: width 2.5s linear` starting at 0% and going to 100%
- Or simpler: use a `@keyframes` approach with `animation: fill 2.5s linear forwards` and reset via key

Implementation:
```tsx
<div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
  <div
    key={wordIndex}
    className="h-full bg-white/80 rounded-r-full"
    style={{
      animation: 'progressFill 2500ms linear forwards',
    }}
  />
</div>
```

Add the keyframe to `index.css` or use inline `@keyframes` isn't possible — instead, use a `useEffect` + state approach:
- State `progress` starts at 0, set to 100 on mount/word change after a tick
- `transition: width 2400ms linear` handles the smooth fill
- Reset to 0 on `wordIndex` change, then set to 100 in a `requestAnimationFrame`

## Summary
- 1 file modified
- Bolder title, no rotation, smooth per-cycle progress bar on image

