

# Fix: Bulk Preview Upload Missing Categories

## Problem
The category dropdown in `/app/admin/bulk-preview-upload` uses a hardcoded list of 13 categories, but the database has 36 active category collections. Categories like eyewear, watches, jewellery, sneakers, swimwear, etc. are all missing.

## Solution
Replace the hardcoded `CATEGORIES` array with a dynamically generated list from the actual database data (`rawScenes` from `useProductImageScenes()`).

### `src/pages/AdminBulkPreviewUpload.tsx`

1. **Remove** the hardcoded `CATEGORIES` constant (lines 15-29)
2. **Add a `useMemo`** that derives categories from `rawScenes`:
   ```typescript
   const categories = useMemo(() => {
     const cats = new Set(rawScenes.filter(s => s.is_active).map(s => s.category_collection));
     return Array.from(cats).sort().map(c => ({
       value: c,
       label: c.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
     }));
   }, [rawScenes]);
   ```
3. **Update** the `<Select>` to use `categories` instead of `CATEGORIES`

This ensures every category in the database automatically appears — no manual sync needed.

### Files changed
- `src/pages/AdminBulkPreviewUpload.tsx` — replace hardcoded categories with dynamic list

