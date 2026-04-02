
# Add Sorting, Image Change & Delete for Workflow Variation Scenes

## Changes (single file: `src/pages/AdminScenes.tsx`)

### 1. Drag/reorder buttons for workflow variations
Add up/down arrow buttons to each variation row (same pattern as existing scene reorder). A new `handleWfVariationMove(wfId, fromIdx, direction)` function swaps adjacent items in the `wfVariationEdits` array and marks the workflow as dirty.

### 2. Image upload for variation scenes
Add an image upload button (camera/image icon) to each variation row. On file select:
- Upload to `scratch-uploads` bucket (same pattern used for custom scene preview uploads)
- Update the variation's `preview_url` field in `wfVariationEdits`
- Mark workflow as dirty

This changes the actual scene image stored in the workflow's `generation_config`, not a separate preview.

### 3. Delete button for individual variations
Add a trash icon button per variation row. On click:
- Remove the variation from the `wfVariationEdits` array at the given index
- Mark the workflow as dirty
- Show confirmation via a simple `window.confirm()` since deletion is destructive

### 4. Add "New Variation" button
Add a `+ Add Variation` button at the bottom of each workflow's variation list. Creates a new empty variation `{ label: 'New Scene', instruction: '', preview_url: '' }` and appends it.

### Summary of UI per variation row

```text
[thumbnail] [label input] [category badge] [ratio badge] [↑] [↓] [📷 upload] [🗑 delete]
```

All changes save when the existing per-workflow "Save" button is clicked — no new save flow needed.
