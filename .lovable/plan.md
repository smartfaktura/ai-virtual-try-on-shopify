

# Add Bulk Delete Button to Library Selection Bar

## What
Add a "Delete" button with confirmation dialog to the floating action bar that appears when multiple items are selected in the Library.

## Changes — `src/pages/Jobs.tsx`

### 1. Add bulk delete state
- `bulkDeleting: boolean` state for loading indicator during deletion

### 2. Add bulk delete handler
Reuse the existing single-item delete logic in a loop:
- For freestyle items: `supabase.from('freestyle_generations').delete().eq('id', id)`
- For generation items: fetch job results, remove the specific image index, or delete the whole job if it was the last image
- Invalidate queries and show success toast with count
- Clear selection after completion

### 3. Add confirmation dialog
A separate `AlertDialog` (or reuse the existing `Dialog` pattern) that shows:
- "Delete {n} images?"
- "This action cannot be undone. {n} images will be permanently removed."
- Cancel + Delete buttons (destructive variant)

### 4. Add Delete button to floating bar
Insert a `Trash2` icon button between "Download ZIP" and the close button:
```
[4 selected] [Enhance 2K/4K] [Download ZIP] [Delete] [×]
```

## File
| File | Change |
|------|--------|
| `src/pages/Jobs.tsx` | Add bulk delete state, handler, confirmation dialog, and button |

