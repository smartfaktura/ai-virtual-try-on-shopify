

# Link "Similar" to Discover Items with Same Scene

## Problem
Currently, clicking "Similar" filters by category and overlapping tags. User wants it to filter by **same scene name** instead — showing all Discover items that used the same scene.

## Changes

### `src/pages/Discover.tsx` — Update similar filter logic (lines 315-331)

Replace the category+tags matching with scene-based matching:

```ts
if (similarTo) {
  // Get scene name from the source item
  const simScene = similarTo.type === 'preset' ? similarTo.data.scene_name : similarTo.data.name;
  if (!simScene) return true; // no scene info, show all
  
  // Match items with the same scene
  const itemScene = item.type === 'preset' ? item.data.scene_name : item.data.name;
  if (itemScene !== simScene) return false;
  
  // Exclude the source item itself
  if (item.type === similarTo.type && getItemId(item) === getItemId(similarTo)) return false;
  return true;
}
```

Also update the "Similar to" chip label (line 454) to show the scene name:
```ts
Similar to: {similarTo.type === 'preset' ? (similarTo.data.scene_name || getItemName(similarTo)) : getItemName(similarTo)}
```

One file, ~10 lines changed.

