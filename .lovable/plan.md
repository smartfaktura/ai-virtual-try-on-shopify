

## Modernize Workflow Recent Creations Carousel and Preview Modal

### Issues Identified

1. **Too many dots**: Every single job gets its own dot indicator -- with 5+ jobs this creates a long row of dots that looks cluttered
2. **Dots not tracking correctly**: The scroll calculation uses a hardcoded `140 + 12` card width, but the actual mobile card width is `130px` with `12px` gap, causing misalignment
3. **"Slider" feel still visible**: Cards still have `snap-start` class on each card, creating snappy behavior
4. **Preview modal thumbnails too large on mobile**: The 2-column grid with square thumbnails takes up too much vertical space, pushing download buttons below the fold

---

### Changes

#### 1. `src/components/app/WorkflowRecentRow.tsx` -- Fix dots and remove slider feel

**Remove snap-start from cards:**
- Remove `snap-start` from the ThumbnailCard button className

**Replace dot indicators with a compact 3-dot iOS-style system:**
- Show max 3 dots at any time (like iOS when many pages exist)
- Active dot is a wide pill (`w-5 h-1.5`), neighbors are medium circles (`w-1.5 h-1.5`), distant items are tiny (`w-1 h-1`)
- Cap visible indicators to 3-5 regardless of total job count
- Only show on mobile when more than 2 items exist

**Fix scroll tracking math:**
- Use actual card width: `130px` on mobile (not 140) + `12px` gap = `142px` per card

#### 2. `src/components/app/WorkflowPreviewModal.tsx` -- Smaller mobile thumbnails

**Make thumbnail grid more compact on mobile:**
- Change from `grid-cols-2` to `grid-cols-4` on mobile for smaller preview thumbnails
- Reduce aspect ratio from `aspect-square` to a smaller fixed size
- This ensures all thumbnails + download buttons fit within the 55vh panel without scrolling

---

### Technical Details

| File | Change |
|------|--------|
| `src/components/app/WorkflowRecentRow.tsx` | Remove `snap-start`, fix scroll tracking to use 130+12=142, replace dots with compact 3-dot iOS indicator (max 5 visible dots with size scaling) |
| `src/components/app/WorkflowPreviewModal.tsx` | Change thumbnail grid to `grid-cols-4` on mobile, reduce thumbnail size so download actions are always visible |

