

## Add Separator for Recent Creations and Improve Mobile Carousel

### Changes

**1. `src/pages/Workflows.tsx`** -- Add a section divider before Recent Creations

Move the "Recent Creations" label out of `WorkflowRecentRow` and into Workflows.tsx as a `section-divider` (same style as "Create a New Set"), with the "View All" button placed on the right. The divider line will extend between the label and the button.

**2. `src/components/app/WorkflowRecentRow.tsx`** -- Remove header row, improve mobile carousel

- Remove the internal header (lines 109-115) with "Recent Creations" label and "View All" button since the parent now handles it
- Make thumbnail cards fill the viewport on mobile: change card width from fixed `w-[140px]` to responsive `w-[130px] sm:w-[140px]` and add `snap-x snap-mandatory` scroll snapping for a proper carousel feel
- Add edge fade gradients (left/right) for visual polish matching the `RecentCreationsGallery` pattern
- Ensure the horizontal scroll container has no clipping issues on mobile

### Layout After Fix

```text
ACTIVITY
[Processing card...]

---- RECENT CREATIONS -------- View All ->
[thumb] [thumb] [thumb] [thumb] [thumb]

---- CREATE A NEW SET -------------------------
[Workflow Card 1]
[Workflow Card 2]
```

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Workflows.tsx` | Add section-divider with "Recent Creations" label before WorkflowRecentRow, move "View All" button there |
| `src/components/app/WorkflowRecentRow.tsx` | Remove internal header, improve mobile carousel with snap scrolling and edge gradients |

