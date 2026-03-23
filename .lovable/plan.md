

# Add Delete Button for Workflow Items in Library Detail Modal

## Problem
The delete button in `LibraryDetailModal` only appears for freestyle items (`item.source === 'freestyle'`). Workflow-generated images have no delete option in the modal.

## Changes

### `src/components/app/LibraryDetailModal.tsx`

1. **Extend `handleDelete`** (lines 73-86) to handle workflow items too. For workflow items, the ID format is `{jobId}-{imageIndex}`. Need to:
   - If freestyle: delete from `freestyle_generations` (existing logic)
   - If generation: extract `jobId` and `imageIndex`, fetch the job, either delete the whole job (if 1 result) or remove that image from the results array (same logic as `Jobs.tsx` lines 198-222)

2. **Remove the `item.source === 'freestyle'` guard** on both the delete handler (line 74) and the delete button render (line 266). Show the delete button for all items.

3. **Add `generation_jobs` invalidation** to query cache invalidation after delete.

One file, ~20 lines changed.

