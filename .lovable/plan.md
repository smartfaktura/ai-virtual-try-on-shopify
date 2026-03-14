

## Fix: Scene Deletion Fails for Static Scenes

### Problem
The delete button on scenes in Discover tries to delete from the `custom_scenes` DB table using the scene's `poseId` (e.g. `scene_009`). But most scenes in the feed are **static/hardcoded** scenes from `src/data/mockData.ts` — they don't exist in `custom_scenes`. Only scenes with IDs prefixed `custom-` are DB-backed.

The DELETE request `custom_scenes?id=eq.scene_009` returns 400 because `scene_009` is not a valid UUID.

### Solution
The `onDelete` handler in `Discover.tsx` needs to distinguish between:
1. **Custom (DB) scenes** — `poseId` starts with `custom-` → delete from `custom_scenes` table
2. **Static scenes** — `poseId` like `scene_009` or `pose_003` → these can't be deleted from DB. Instead, hide them by soft-deleting: either don't show the delete button, or add them to a "hidden scenes" list.

**Recommended approach**: For static scenes, set `is_active = false` isn't possible (they're not in DB). Instead, insert a record into a simple `hidden_static_scenes` table, or more practically: **only show the delete button for custom (DB-backed) scenes**, since static scenes are part of the codebase and can only be removed by editing code.

However, if you want admin control over all scenes including static ones, the cleanest approach is:
- Only show delete for `custom-` prefixed scenes (DB scenes)
- For static scenes, hide the delete button — admin can remove them by editing `mockData.ts`

### Changes

**`src/pages/Discover.tsx`** (~line 511-525)
- Add a check: if the scene's `poseId` starts with `custom-`, allow deletion from `custom_scenes`. Otherwise, show toast explaining static scenes can't be deleted.
- Alternatively, only pass `onDelete` when the item is a preset OR a custom scene (has `custom-` prefix).

```typescript
onDelete={selectedItem && isAdmin ? async () => {
  if (selectedItem.type === 'preset') {
    // existing preset delete
  } else {
    const poseId = (selectedItem.data as any).poseId ?? '';
    if (!poseId.startsWith('custom-')) {
      toast.error('Built-in scenes cannot be deleted');
      return;
    }
    const sceneId = poseId.replace('custom-', '');
    const { error } = await supabase.from('custom_scenes').delete().eq('id', sceneId);
    if (error) { toast.error('Failed to delete scene'); return; }
    toast.success('Scene deleted');
    queryClient.invalidateQueries({ queryKey: ['custom-scenes'] });
  }
  setSelectedItem(null);
} : undefined}
```

Single file, ~3 lines changed.

