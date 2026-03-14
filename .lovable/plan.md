

## Add Admin Delete Button for Scenes in Discover

### Problem
Currently the delete button in the Discover detail modal only appears for presets (`isPreset`). Scenes from `custom_scenes` table have no delete option, so admins can't remove them from the feed.

### Changes

**`src/components/app/DiscoverDetailModal.tsx`** (~line 294)
- Remove the `&& isPreset` condition from the delete button guard so it renders for both presets and scenes when `isAdmin && onDelete` are truthy.
- Update the dialog description to be generic (remove "from the Discover feed").

**`src/pages/Discover.tsx`** (~lines 511-517)
- Extend the `onDelete` handler to also handle scene items. When the selected item is a scene, delete from the `custom_scenes` table using `useDeleteCustomScene` (already exists in `useCustomScenes.ts`), then invalidate `['custom-scenes']`.
- Change the condition from `selectedItem?.type === 'preset' && isAdmin` to just `isAdmin` so the handler is provided for both types.

Logic:
```
onDelete={isAdmin ? async () => {
  if (selectedItem.type === 'preset') {
    // existing preset delete logic
  } else {
    // delete from custom_scenes using scene id (strip 'custom-' prefix)
    await supabase.from('custom_scenes').delete().eq('id', sceneId);
    invalidate(['custom-scenes']);
  }
} : undefined}
```

### Technical Details
- The scene `poseId` format is `custom-{uuid}` — we strip the prefix to get the DB id.
- RLS on `custom_scenes` already allows admin DELETE via `has_role(auth.uid(), 'admin')`.
- Invalidating `['custom-scenes']` ensures the scene disappears from Discover, Freestyle, and Workflows since they all source from the same query.

Two files changed, ~10 lines modified total.

