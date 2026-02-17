

## Fix Recent Creations Carousel UX and Click Sensitivity

### Problem
1. The horizontal scroll row of recent creations has no visual indicator (dots/pagination) on mobile, making it unclear there are more items
2. Thumbnail cards are too click-sensitive -- scrolling/swiping accidentally triggers the preview modal
3. Need a clearer "tap to view" affordance

### Changes

#### 1. `src/components/app/WorkflowRecentRow.tsx` -- Add swipe-vs-tap detection and dot indicators

**Swipe guard**: Track `pointerdown` position. Only trigger `onSelect` if the pointer moved less than 8px (intentional tap vs accidental swipe). This prevents the modal from opening when users are just scrolling the carousel.

```text
// Pseudocode for swipe guard
onPointerDown -> save startX, startY
onClick -> if abs(deltaX) > 8 || abs(deltaY) > 8, ignore click
```

**Dot indicators on mobile**: After the scrollable row, render a row of small dots (one per job) that highlight based on scroll position. Use `IntersectionObserver` or scroll event on the container to determine which card is most visible. Show dots only on mobile (`md:hidden`).

**"View" overlay on hover/tap**: Add a semi-transparent overlay on each thumbnail that shows "View" text on hover (desktop) and always-visible subtle icon on mobile, making it clear the card is interactive.

#### 2. `src/components/app/WorkflowRecentRow.tsx` -- ThumbnailCard changes

- Add an `onPointerDown` handler to record start position
- Modify `onClick` to check pointer travel distance before calling `onSelect`
- Add a hover overlay with "View" label and an Eye icon
- On mobile, show a small Eye icon in the corner permanently

### Files to Modify

| File | Change |
|------|--------|
| `src/components/app/WorkflowRecentRow.tsx` | Add swipe guard logic, dot pagination indicators (mobile), and "View" hover overlay on thumbnails |

### Technical Details

**Swipe guard implementation:**
- Store `startX`/`startY` in a ref on `onPointerDown`
- On `onClick`, compute delta. If > 8px threshold, `preventDefault` and skip `onSelect`
- This is a common pattern for scrollable carousels with clickable items

**Dot indicators:**
- Use a `useRef` on the scroll container
- Listen to `scroll` event, calculate which card index is closest to center
- Render `count` dots below the row, highlight the active one
- Wrap in `div className="flex justify-center gap-1.5 pt-3 md:hidden"`
- Each dot: `w-1.5 h-1.5 rounded-full bg-muted-foreground/20` (active: `bg-primary`)

**View overlay:**
- On each `ThumbnailCard`, add `<div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors flex items-center justify-center"><Eye className="w-5 h-5 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity" /></div>`
- On mobile: small Eye icon badge in bottom-left corner, always visible

