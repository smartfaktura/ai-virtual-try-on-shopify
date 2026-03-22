

# Remove Search Bar + Bigger Premium Category Pills on Discover Pages

## Changes

### 1. `src/pages/PublicDiscover.tsx`

**Remove search bar** (lines 364-373): Delete the entire search input block. Remove `searchQuery` state and `Search` import (keep `Compass` for empty state). Remove search filtering logic from the `filtered` useMemo.

**Bigger, more premium pills** (lines 376-390): Update pill styling:
- `px-6 py-2.5 text-[15px]` — larger, more generous padding
- Unselected: `bg-muted/20 text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground` — softer, more refined
- Selected: keep `bg-foreground text-background shadow-sm`
- Add `tracking-wide` for a slightly more editorial/luxury feel
- Container: `gap-2.5` for more breathing room between pills

### 2. `src/pages/Discover.tsx`

**Remove search bar** (lines 449-458): Delete the search input block. Remove `searchQuery` state, `Search` import, and search filtering from `filtered` useMemo. Keep the "Similar to" chip functionality.

**Same premium pill styling** as PublicDiscover: `px-6 py-2.5 text-[15px] tracking-wide`, softer unselected colors, `gap-2.5`.

### 3. Cleanup
- Remove unused `Search` import from both files (keep if used elsewhere)
- Remove unused `Input` import from PublicDiscover if no longer needed

### Result
Clean, search-free discover pages with larger, more luxurious category pills that feel editorial and premium.

