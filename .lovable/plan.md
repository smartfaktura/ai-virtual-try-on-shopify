

# Make Rotating Words Stand Out More

## Problem
The rotating words (sneakers, skincare, furniture...) use `text-primary` which is dark navy on a dark heading — not enough contrast to distinguish them.

## Changes

### File: `src/pages/TryShot.tsx` (line 147)

Make the rotating word visually distinct with a highlighted background pill + italic style:

```tsx
<span className="text-primary italic underline decoration-primary/30 underline-offset-4 decoration-2">
```

This adds:
- **Italic** — immediately differentiates the dynamic word from "Product shots for"
- **Underline with offset** — subtle navy underline decoration draws the eye
- **30% opacity underline** — elegant, not heavy

Alternative if you want even bolder: swap to a background highlight approach:
```tsx
<span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">
```
This puts a light navy tinted box behind the word.

## Summary
- 1 line changed — class update on the rotating word `<span>`

