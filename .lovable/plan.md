

# Update "Create Product Visuals" card link

## Change

**File: `src/pages/Dashboard.tsx`, line 342**

Change the "Open" button route from `/app/workflows` to `/app/generate/product-images`.

Only the first card's button (line 342) needs updating — the other `/app/workflows` references are in different sections (quick-access bar, returning user card) and should stay as-is.

## Files changed
- `src/pages/Dashboard.tsx` — one route string update

