
## Optimize Recent Creations Gallery: Load Only 5 Items

### Problem
The gallery currently fetches up to 12 generation jobs + 8 freestyle generations (20 DB rows total), processes them, then slices to 10. This is slow and wasteful since the dashboard only shows ~5 visible cards in the horizontal scroll.

### Solution
Reduce query limits to fetch only what's needed -- 5 items total -- making the dashboard load noticeably faster.

### File: `src/components/app/RecentCreationsGallery.tsx`

1. **Reduce `generation_jobs` query limit** from 12 to 5
2. **Reduce `freestyle_generations` query limit** from 8 to 3
3. **Change final slice** from `.slice(0, 10)` to `.slice(0, 5)` -- only keep 5 items
4. **Reduce placeholder images** from 6 to 5 to match
5. **Update skeleton count** from 5 to 5 (already correct)

### Technical Details

```text
Line 40:  .limit(12)  -->  .limit(5)
Line 72:  .limit(8)   -->  .limit(3)
Line 86:  .slice(0, 10)  -->  .slice(0, 5)
Line 16:  PLACEHOLDER_IMAGES array trimmed to 5 items
```

Single file change. Fewer rows fetched = faster query = faster render.
