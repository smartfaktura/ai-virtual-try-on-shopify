

## Reorder Dashboard Workflow Cards

### Change

Update the workflow query in `src/pages/Dashboard.tsx` to sort workflows by `sort_order` instead of alphabetical `name`, and add a client-side fallback sort to enforce the desired display order:

1. **Virtual Try-On Set** (first)
2. **Product Listing Set**
3. **Selfie / UGC Set**
4. **Mirror Selfie Set**
5. **Flat Lay Set**

### Technical Details

**File: `src/pages/Dashboard.tsx`**

1. Change the workflow query from `.order('name')` to `.order('sort_order')` (line 184) so it respects the database ordering used elsewhere (e.g., Creative Drops page).

2. Add a client-side sort as a safety net using a priority map, so even if `sort_order` values in the DB don't match, the dashboard always shows the correct sequence:

```text
const workflowOrder = {
  'Virtual Try-On Set': 1,
  'Product Listing Set': 2,
  'Selfie / UGC Set': 3,
  'Mirror Selfie Set': 4,
  'Flat Lay Set': 5,
};
```

3. Apply `.sort()` on the workflows array before rendering in the grid (line 284).

