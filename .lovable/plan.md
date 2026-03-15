

## Don't Pre-select Source + Smaller Product Cards + Load More Button

### Changes (all in `src/pages/Perspectives.tsx`)

#### 1. No source pre-selected on load
- Change `SourceType` to allow `null`: `SourceType | null`
- Set initial state to `null` (keep `'scratch'` only when `?source=` query param is present)
- Update `handleSourceTypeChange` to accept `SourceType | null`
- When `sourceType === null`, don't render any picker below the source cards, just show the 3 unselected cards
- Update the "Selected" indicator and styling to not highlight any card when `null`
- Update downstream totalImages / generate button logic to treat `null` like no source (already works since no items will be selected)

#### 2. Smaller product cards
- Change the product grid from `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` to `grid-cols-3 sm:grid-cols-4 md:grid-cols-5` (matching library grid)
- Remove `mb-2` spacing and reduce padding from `p-2` to `p-1.5`
- Change product image aspect from `aspect-square` to a smaller fixed size or keep aspect-square with the smaller grid

#### 3. Load More button (for both library and products)
- Add `libraryVisibleCount` state (default: 10, which is ~2 rows of 5 columns)
- Add `productVisibleCount` state (default: 10)
- Slice `filteredLibrary` and `filteredProducts` to visible count
- Remove `max-h-[360px] overflow-y-auto` from both grids (no more scroll container)
- Add a "Load more" button below each grid when there are more items than visible count, incrementing by 10 on click
- Reset visible counts when search text changes

### Files changed
| File | Change |
|------|--------|
| `src/pages/Perspectives.tsx` | All three changes above |

