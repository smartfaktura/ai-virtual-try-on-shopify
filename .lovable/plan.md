

## Add Delete Button on Library Image Cards

### What Changes

Add a delete (X) button on the bottom-left of each library image card, visible on hover -- opposite the existing download button on the bottom-right. Clicking it deletes the image after a brief confirmation.

### How It Works

- **Freestyle items**: Delete the row from `freestyle_generations` table (same logic already in the detail modal)
- **Generation items**: Generation jobs can have multiple result images. Since each card maps to one image within a job's `results` array, deletion will remove that specific image URL from the array. If it's the last image, the entire job row is deleted.

### Files to Modify

| File | Change |
|------|--------|
| `src/components/app/LibraryImageCard.tsx` | Add `onDelete` callback prop; render a Trash2/X icon button in bottom-left of hover overlay; call `e.stopPropagation()` then `onDelete` |
| `src/pages/Jobs.tsx` | Implement `handleDeleteItem` function that handles both freestyle and generation deletions; pass it as `onDelete` to each card; invalidate library queries after delete |

### Technical Details

**LibraryImageCard.tsx -- add delete button in hover overlay (bottom section):**

The existing bottom row has date on the left and download on the right. We'll put the delete button next to the date on the left side:

```tsx
// Bottom row of hover overlay
<div className="flex justify-between items-end">
  <div className="flex items-center gap-2">
    <span className="text-[10px] text-white/60">{item.date}</span>
    {!selectMode && (
      <button
        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
        className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-500/70 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )}
  </div>
  {/* Download button stays on the right */}
</div>
```

**Jobs.tsx -- delete handler:**

```tsx
const handleDeleteItem = async (item: LibraryItem) => {
  if (item.source === 'freestyle') {
    await supabase.from('freestyle_generations').delete().eq('id', item.id);
  } else {
    // item.id is "jobId-index" format
    const [jobId, indexStr] = item.id.split('-');
    // Fetch current results, remove the image, update or delete the job
  }
  queryClient.invalidateQueries({ queryKey: ['library'] });
  toast.success('Image deleted');
};
```

A confirmation step (e.g., `window.confirm` or a brief toast with undo) will be added to prevent accidental deletions.

