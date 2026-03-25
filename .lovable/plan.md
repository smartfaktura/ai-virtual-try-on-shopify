

# Fix: Optimize Workflow Product Images + Add Pagination

## Problem
1. Product images in workflow selection grids load at **full resolution** — unlike Freestyle which uses `getOptimizedUrl` with `quality: 60`
2. No pagination — all products render at once, poor UX for 1000+ products

## Changes — `src/pages/Generate.tsx`

### 1. Replace raw `<img>` with `<ShimmerImage>` + `getOptimizedUrl`

There are **4 product grid/list sections** (two for try-on workflows, two for listing/UGC workflows) that use raw `<img src={up.image_url}>`. Each will be updated to:

```tsx
<ShimmerImage
  src={getOptimizedUrl(up.image_url, { quality: 60 })}
  alt={up.title}
  className="w-full aspect-square object-cover rounded-t-md"
/>
```

Same for list-view thumbnails (`w-10 h-10`). Also update the small product chips in the generating/results steps (~lines 3963, 4135).

Both `ShimmerImage` and `getOptimizedUrl` are already imported in this file.

### 2. Add "Load More" pagination (max 22 per page)

- Add state: `const [visibleCount, setVisibleCount] = useState(22);`
- Slice `filteredProducts` to `filteredProducts.slice(0, visibleCount)` before mapping
- Reset `visibleCount` to 22 when search query changes
- Show a "Load more" button below the grid when `filteredProducts.length > visibleCount`:
  ```tsx
  {filteredProducts.length > visibleCount && (
    <Button variant="outline" onClick={() => setVisibleCount(c => c + 22)} className="w-full mt-3">
      Load more ({filteredProducts.length - visibleCount} remaining)
    </Button>
  )}
  ```

### Files
- `src/pages/Generate.tsx` — only file changed

