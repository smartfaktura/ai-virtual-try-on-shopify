

## Clean Up Carousel to Apple-Inspired Design

### Changes to `src/components/app/WorkflowRecentRow.tsx`

**1. Replace dot indicators with a modern Apple-style pill indicator**
- Instead of individual dots for each item, use a single capsule/pill track with a sliding active segment
- Show only 3-5 dots max (grouped) like iOS page indicators -- if more items exist, compress into a smaller set
- Use `w-6 h-1 rounded-full` capsule shape for active, `w-1.5 h-1.5 rounded-full` for inactive, with smooth width transition

**2. Remove edge fade gradients**
- Delete the two `pointer-events-none` gradient divs (lines 184-186) that create the "doggy faded look"

**3. Simplify the carousel container**
- Remove `snap-x snap-mandatory` to reduce the snappy/slider feel -- let it scroll freely and smoothly
- Keep `scrollbar-none` for clean look

### Summary of visual changes

| Element | Before | After |
|---------|--------|-------|
| Edge fades | Left/right gradient overlays | Removed entirely |
| Dots | Individual circles per item | Apple-style pill: active = wide capsule, inactive = small dot |
| Scroll behavior | `snap-x snap-mandatory` (snappy) | Free smooth scroll |
| Overall feel | "Slider" with fades | Clean, minimal horizontal scroll |

### File

| File | Change |
|------|--------|
| `src/components/app/WorkflowRecentRow.tsx` | Remove edge fades, replace dots with pill indicator, remove snap scroll |

