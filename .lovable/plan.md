

## Fix: Category Card Image Transition Flashes on Mobile

### Root cause
When the crossfade transition ends, `handleTransitionEnd` simultaneously:
1. Updates `displayIndex` to the new image
2. Sets `incomingIndex = null` (removing the top layer)
3. Sets `fadeIn = false`

For 1-2 frames, the incoming layer is unmounted but the base `ShimmerImage` hasn't re-rendered with the new `src` yet — causing a visible flash/gap on mobile where rendering is slower.

### Fix

**File: `src/components/landing/ProductCategoryShowcase.tsx`**

Change the swap logic so the incoming layer stays visible until the base layer has updated:

1. In `handleTransitionEnd`, only update `displayIndex` — keep the incoming layer mounted at full opacity
2. Use a `useEffect` watching `displayIndex` to clear `incomingIndex` and `fadeIn` on the **next render cycle**, after the base ShimmerImage has re-rendered with the new src
3. This guarantees the top layer covers the base layer during the 1-2 frame gap where the base image swaps

```text
Before (single frame):
  displayIndex = new  ←  base re-renders (may flash)
  incomingIndex = null ← top layer removed instantly
  
After (two-phase):
  Frame 1: displayIndex = new, incoming layer still visible at opacity 1
  Frame 2: incomingIndex = null, base layer already showing new image underneath
```

This is a small change to the `handleTransitionEnd` callback and one new `useEffect` — no other files affected.

