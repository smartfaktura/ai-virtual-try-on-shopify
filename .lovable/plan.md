

# Add Arrow Navigation + Move Saved to Right Side

## Changes

### File: `src/pages/Discover.tsx`

1. **Move "Saved" out of CATEGORIES array** — Remove `{ id: 'saved', label: 'Saved' }` from the array. Render it separately on the right side of the bar.

2. **Wrap category bar in a flex container** with left/right arrow buttons and Saved pill:

```text
[←] [All] [Fashion] [Beauty] ... [Health] [→]    [Saved · 2]
```

- **Left arrow**: `ChevronLeft` icon, `w-4 h-4`, `text-muted-foreground/50 hover:text-foreground`, no border/bg, just a bare icon. Hidden when scrolled to start.
- **Right arrow**: Same with `ChevronRight`. Hidden when scrolled to end.
- Arrows click to scroll the container by ~200px
- **Saved pill**: Sits outside the scrollable area, right-aligned with `ml-auto`, separated by a subtle `border-l border-border/30` divider

3. **Use a `useRef` for scroll container** + state to track `canScrollLeft` / `canScrollRight` to show/hide arrows.

### File: `src/pages/PublicDiscover.tsx`

Same arrow treatment for the category bar (no Saved pill since public page).

### Layout structure
```tsx
<div className="flex items-center gap-2">
  {/* Left arrow */}
  <button onClick={scrollLeft} className={cn("shrink-0 p-1", !canScrollLeft && "invisible")}>
    <ChevronLeft className="w-4 h-4 text-muted-foreground/50 hover:text-foreground" />
  </button>
  
  {/* Scrollable categories */}
  <div ref={scrollRef} className="fade-scroll flex gap-2 overflow-x-auto scrollbar-hide ...">
    {categories pills}
  </div>
  
  {/* Right arrow */}
  <button onClick={scrollRight} className={cn("shrink-0 p-1", !canScrollRight && "invisible")}>
    <ChevronRight className="w-4 h-4 text-muted-foreground/50 hover:text-foreground" />
  </button>
  
  {/* Saved - Discover.tsx only */}
  <div className="shrink-0 ml-2 pl-3 border-l border-border/30">
    <SavedPill />
  </div>
</div>
```

### Desktop only arrows
Hide arrows on mobile (`hidden sm:block`) — mobile keeps the touch-scroll behavior.

### Files changed
- `src/pages/Discover.tsx` — restructure category bar, move Saved right, add arrows
- `src/pages/PublicDiscover.tsx` — add arrows (no Saved)

