

# Improve Product Upload Experience in Product Images

## Problem
When uploading a product from the empty state:
1. The empty state shows, user clicks upload, but the loading skeleton only exists in the grid view — so the empty state stays static during upload
2. After the product is created and the query invalidates, there's a jarring transition (blank flash) as the empty state switches to the grid
3. A toast "Product created — select shots next" fires, which is redundant — the product appearing selected in the grid is clear enough

## Fix

### `src/pages/ProductImages.tsx`

**1. Show loading state inside the empty state** (line ~1041)

Change the empty state condition to also show a loading view when `quickUploading` is true and there are no products yet:

```tsx
{!isLoadingProducts && userProducts.length === 0 && !quickUploading ? (
  // existing empty state UI...
) : quickUploading && userProducts.length === 0 ? (
  // Upload-in-progress state: centered spinner with progress text
  <div className="flex flex-col items-center justify-center py-20 space-y-4 border-2 border-dashed border-border rounded-xl bg-muted/30">
    <Loader2 className="w-10 h-10 text-primary animate-spin" />
    <div className="text-center space-y-1">
      <p className="text-base font-semibold">{quickUploadProgress || 'Uploading…'}</p>
      <p className="text-sm text-muted-foreground">Your product will appear here in a moment</p>
    </div>
  </div>
) : (
  // existing grid view...
)}
```

This keeps the user in the same visual container (dashed border box) but replaces the upload prompt with a spinner and progress text ("Uploading…" → "Analyzing…" → "Creating product…").

**2. Remove the toast** (line ~182)

Delete `toast.success('Product created — select shots next');` — the product card appearing selected in the grid is sufficient feedback.

| File | Change |
|------|--------|
| `src/pages/ProductImages.tsx` | Add upload-in-progress state to empty view, remove success toast |

