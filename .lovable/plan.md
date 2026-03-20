

# Fix: Workflow Thumbnails Show Grey Letterboxing

## Problem
The `w-20 h-24` container uses `object-contain`, which fits vertical images inside the box and fills the rest with the grey `bg-muted` background. Result: narrow image strips surrounded by grey space.

## Solution
Switch to a **square container** (`w-16 h-16`) with `object-cover` and `object-top` positioning. Square thumbnails will only minimally crop the edges of portrait images (showing the top/center — the most important part), eliminating the grey letterbox entirely. The smaller square also fits better alongside the text content.

## Change

### File: `src/components/app/CreativeDropWizard.tsx` (line 948-949)

```tsx
// Before
<div className="w-20 h-24 rounded-xl bg-muted overflow-hidden flex-shrink-0">
  <ShimmerImage src={...} className="w-full h-full object-contain" aspectRatio="5/6" />
</div>

// After
<div className="w-16 h-16 rounded-xl bg-muted overflow-hidden flex-shrink-0">
  <ShimmerImage src={...} className="w-full h-full object-cover object-top" aspectRatio="1/1" />
</div>
```

`object-cover` fills the square completely (no grey), `object-top` anchors to the top of portrait images so faces/products stay visible. Slightly smaller (64px) keeps the row compact.

## Summary
- 1 file, 2 lines changed
- Eliminates grey letterboxing by using square crop with top-anchored positioning

