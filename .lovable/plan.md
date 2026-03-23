

# Fix Dashboard Discover Section: Uniform 4:3 Images, Category Ordering, Load More

## Problems
1. **Images not uniform 4:3**: `ShimmerImage` drops `aspectRatio` from wrapper after image loads (line 47: `!loaded` condition), so images revert to natural size. The `<img>` itself has `h-auto` so it doesn't crop.
2. **Different images than Discover page**: Dashboard uses same data source but both pages show `sort_order` ascending — should be consistent.
3. **Personalized category not reordered in bar**: If user prefers "Accessories", it should appear first in the category list.
4. **No "Load more" button**.

## Changes

### 1. `src/components/app/DiscoverCard.tsx` (line 49-55)

When `aspectRatioOverride` is set, wrap the image in a fixed-ratio container with `object-cover` instead of relying on ShimmerImage's broken aspect ratio behavior:

```tsx
{aspectRatioOverride ? (
  <div className="w-full overflow-hidden" style={{ aspectRatio: aspectRatioOverride }}>
    <ShimmerImage
      src={getOptimizedUrl(imageUrl, { quality: 60 })}
      alt={...}
      className="w-full h-full object-cover block ..."
      loading="lazy"
    />
  </div>
) : (
  <ShimmerImage ... aspectRatio="3/4" />
)}
```

This forces a consistent 4:3 box and `object-cover` crops the image to fill it uniformly.

### 2. `src/components/app/DashboardDiscoverSection.tsx`

**Reorder categories**: When `defaultCategory` is not `'all'`, move that category to position index 1 (right after "All") in the categories array:

```tsx
const orderedCategories = useMemo(() => {
  if (defaultCategory === 'all') return CATEGORIES;
  const base = CATEGORIES.filter(c => c.id !== defaultCategory);
  const preferred = CATEGORIES.find(c => c.id === defaultCategory);
  if (!preferred) return CATEGORIES;
  return [base[0], preferred, ...base.slice(1)]; // "All" first, then preferred, then rest
}, [defaultCategory]);
```

**Add "Load more" button**: Track `visibleCount` state starting at 16. Show a "Load more" button below the grid that increments by 16. Change `.slice(0, 16)` to `.slice(0, visibleCount)`. Reset `visibleCount` to 16 when category changes.

```tsx
const [visibleCount, setVisibleCount] = useState(16);
// Reset on category change
useEffect(() => setVisibleCount(16), [activeCategory]);

const filtered = useMemo(() => {
  const items = activeCategory === 'all' ? allItems : allItems.filter(...);
  return items;
}, [allItems, activeCategory]);

const visible = filtered.slice(0, visibleCount);
const hasMore = filtered.length > visibleCount;
```

After the grid:
```tsx
{hasMore && (
  <div className="flex justify-center pt-2">
    <Button variant="outline" size="sm" onClick={() => setVisibleCount(c => c + 16)}>
      Load more
    </Button>
  </div>
)}
```

### Files
- `src/components/app/DiscoverCard.tsx` — force 4:3 container with `object-cover` when `aspectRatioOverride` is set
- `src/components/app/DashboardDiscoverSection.tsx` — reorder categories by user preference, add load more button, reset count on category change

