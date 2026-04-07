

# Add Delete Button with Confirmation to Scene Rows

## Problem
The `deleteScene` mutation exists in the hook and is imported on the page, but no delete button is rendered in the `SceneRow` component — so admins have no way to permanently remove a scene.

## Plan

### File: `src/pages/AdminProductImageScenes.tsx`

1. **Add a Trash icon button** to the action buttons area in `SceneRow` (next to the edit/visibility/move buttons).

2. **Add an AlertDialog confirmation step** — clicking the trash icon opens a confirmation dialog ("Delete scene permanently? This cannot be undone.") with Cancel and Delete actions.

3. **Wire the `deleteScene` mutation** — pass `deleteScene` and its pending state down from the parent component to `SceneRow`. On confirm, call `deleteScene.mutate(scene.id)` and show a success toast.

4. **Import missing components** — add `Trash2` from lucide-react, and import `AlertDialog` components from the UI library.

### Technical detail
- The `SceneRow` component receives a new `onDelete` callback prop
- The parent maps it to `deleteScene.mutate(scene.id)`
- The AlertDialog is local state inside `SceneRow` (a `showDeleteConfirm` boolean)
- The delete button is styled with `text-destructive` to make it visually distinct

