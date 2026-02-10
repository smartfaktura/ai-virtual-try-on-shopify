

## Fix Freestyle Gallery: Masonry Layout and Clickable Images

### Problem 1: White Spacing / Non-Masonry Layout

The current Freestyle gallery uses two layouts:
- **3 or fewer images**: A horizontal flex row with natural sizing
- **4+ images**: A `grid grid-cols-3 gap-1` fixed grid

The fixed grid forces all cells to the same height, creating white space when images have different aspect ratios. We need to switch to a true masonry layout using flex columns (the same approach used in Library and Discover).

### Problem 2: Click to Preview

Currently, users must click the small Expand icon to open the lightbox. The entire image should be clickable to open the preview, with action buttons (delete, copy, download) still working independently via `stopPropagation`.

### Files to Modify

| File | Change |
|------|--------|
| `src/components/app/freestyle/FreestyleGallery.tsx` | Replace grid layout with flex-column masonry; make entire image card clickable for lightbox; keep action buttons independent |

### Technical Details

**Masonry layout (replacing the grid for 4+ images):**

```tsx
// Distribute items into 3 columns by index
const columns = [[], [], []];
allCards.forEach((card, i) => columns[i % 3].push(card));

return (
  <div className="flex gap-1 pt-3 px-1 pb-4">
    {columns.map((col, i) => (
      <div key={i} className="flex-1 flex flex-col gap-1">
        {col}
      </div>
    ))}
  </div>
);
```

**Make image clickable:**

Wrap the image area with an `onClick={() => onExpand(idx)}` on the card container itself. Action buttons already use individual click handlers -- we add `e.stopPropagation()` to each to prevent triggering the lightbox. The dedicated Expand button can be removed since the whole card now serves that purpose, keeping the overlay cleaner.

**Small images layout (3 or fewer):**

Keep the current horizontal centered layout but also make images clickable for preview.

