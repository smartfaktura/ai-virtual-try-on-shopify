

## Narrow the floating generate bar on the Perspectives page

### Problem
The sticky "Generate X images" bar at the bottom of the Picture Perspectives page stretches too wide, overlapping with the customer support chat icon in the bottom-right corner.

### Change

**File: `src/pages/Perspectives.tsx` (line 1015-1016)**

Add horizontal margin/max-width and extra right-side spacing to the sticky bar so it doesn't touch the support icon. Specifically:
- Add `max-w-3xl mx-auto` to the sticky container (line 1015) to constrain its width within the parent `max-w-5xl`
- This centers the bar and creates equal spacing on both sides, matching the sidebar's visual rhythm

```tsx
{/* Before */}
<div className="sticky bottom-4 z-50">
  <div className="bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-lg p-4 flex items-center justify-between gap-4">

{/* After */}
<div className="sticky bottom-4 z-50 max-w-3xl mx-auto">
  <div className="bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-lg p-4 flex items-center justify-between gap-4">
```

Single class addition, one file. The bar stays centered and leaves room for the chat icon.

