

## Fix: Featured Images Spreading Across Columns Instead of Stacking Down

### Problem

The CSS `columns` (masonry) layout fills content **top-to-bottom, then left-to-right**. Since featured items are sorted first in the array, they all stack in the first column before any appear in column 2, 3, or 4. This makes it look like featured items only appear in one column.

### Solution

Switch from CSS `columns` to **CSS Grid** layout for the Discover page. CSS Grid with `grid-template-columns` and `grid-auto-flow: dense` will distribute items across all columns evenly, row by row (left-to-right, then top-to-bottom).

However, CSS Grid requires fixed heights which breaks the masonry (variable height) look. To keep the masonry aesthetic while distributing items horizontally, we use a **JavaScript-based column distribution** approach: split the sorted items into N column arrays in round-robin fashion, then render each column as a flex column.

### Changes

**File: `src/pages/Discover.tsx`**

Replace the masonry grid rendering section with a round-robin column distribution:

```tsx
// Split items into columns round-robin style
const columnCount = 4; // responsive: detect from screen width or use fixed
const columns: DiscoverItem[][] = Array.from({ length: columnCount }, () => []);
sorted.forEach((item, i) => {
  columns[i % columnCount].push(item);
});

// Render as flex row of flex columns
<div className="flex gap-1">
  {columns.map((col, colIdx) => (
    <div key={colIdx} className="flex-1 flex flex-col gap-1">
      {col.map(item => (
        <DiscoverCard key={...} item={item} ... />
      ))}
    </div>
  ))}
</div>
```

This ensures featured items (sorted first) distribute: column 1, column 2, column 3, column 4, column 1, ... instead of all stacking in column 1.

**Responsive column counts** will be handled via a small hook or state that reads `window.innerWidth`:
- `< 640px`: 2 columns
- `< 1024px`: 3 columns  
- `< 1280px`: 4 columns
- `>= 1280px`: 5 columns

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Discover.tsx` | Replace CSS `columns-*` masonry with JS-based round-robin column distribution using flex layout |

### Why Not Change the Sort?

Removing featured-first sorting would fix the column issue but break the desired behavior of showing featured content prominently. The round-robin approach keeps featured items first AND spreads them across all columns.

