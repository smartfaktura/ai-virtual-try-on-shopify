

# Fix Perspectives Estimated Generation Time

## Problem
The Perspectives generation screen shows "Est. 4m 12s – 6m 18s total" for 9 images, but they actually complete in ~37 seconds. The estimate uses `35 seconds per image` calculated sequentially, but jobs run in parallel so effective per-image time is much lower.

## Fix

### File: `src/pages/Perspectives.tsx` (line 508)

Change `estimatedSecondsPerImage` from `35` to `5` to reflect actual parallel throughput (~4-5s effective per image):

```tsx
// Before
const estimatedSecondsPerImage = 35;

// After
const estimatedSecondsPerImage = 5;
```

For 9 images this gives: `Est. 36s – 54s total` — much closer to the real ~37s observed.

### Files
- `src/pages/Perspectives.tsx` — 1 constant change

