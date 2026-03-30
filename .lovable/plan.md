

## Make Product Picker 3 Columns on Mobile

### Change

**File: `src/components/app/freestyle/ProductSelectorChip.tsx`** (line 164)

Change the mobile grid from 2 columns to 3 columns:

```
// Before
isMobile ? "grid-cols-2" : "grid-cols-3"

// After
"grid-cols-3"
```

Since both mobile and desktop use 3 columns, simplify to just `"grid-cols-3"`.

