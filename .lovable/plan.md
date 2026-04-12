
# Fix Admin Scene Sorting So Last Edited Categories Actually Move to the Top

## What I found
The timestamp tracking is already working:
- `product_image_scenes.updated_at` exists
- recent rows in the database have fresh `updated_at` values
- the admin page already sorts scenes **inside each category** by `updated_at DESC`

The remaining bug is in the page rendering:
- `/app/admin/product-image-scenes` is shown as **collapsed category sections**
- those category sections are still rendered in the `Map` insertion order
- that insertion order comes from `rawScenes`, which is fetched by `sort_order`
- so even after editing a scene, the **category card** stays in its old place, making it look like sorting is broken

## Plan
### 1. Update the admin grouping logic
In `src/pages/AdminProductImageScenes.tsx`:
- replace the current `grouped` `Map`-only approach with a derived `groupedEntries` array
- for each category, compute:
  - `scenes` sorted by `updated_at DESC` (fallback `created_at`)
  - `latestUpdatedAt` = newest timestamp among scenes in that category
  - `categorySortOrder` = stable fallback for ties

### 2. Sort category sections by most recently edited scene
Sort the category entries by:
1. `latestUpdatedAt DESC`
2. `categorySortOrder ASC`
3. category label/name as final stable fallback

This will make the category containing the last edited/added scene jump to the top immediately.

### 3. Render from the sorted category entries
Change the JSX from:
- `Array.from(grouped.entries()).map(...)`

to:
- `groupedEntries.map(...)`

Also update the `Import` / `New` button helpers to use the computed category metadata instead of relying on `scenes[0]`.

### 4. Keep the current per-scene sorting
Do not change the product flow or the shared hook behavior.
Only the admin page ordering should change:
- category cards sorted by latest activity
- scenes within each category still sorted by latest edit first

## Technical details
A clean shape for the derived data is:

```ts
type GroupedCategory = {
  key: string;
  scenes: DbScene[];
  latestUpdatedAt: number;
  categorySortOrder: number;
};
```

And the core logic should be:

```ts
const groupedEntries = useMemo(() => {
  const map = new Map<string, DbScene[]>();

  for (const s of filtered) {
    const key = s.category_collection || 'other';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }

  return Array.from(map.entries())
    .map(([key, scenes]) => {
      const sortedScenes = [...scenes].sort(
        (a, b) =>
          new Date(b.updated_at ?? b.created_at).getTime() -
          new Date(a.updated_at ?? a.created_at).getTime()
      );

      return {
        key,
        scenes: sortedScenes,
        latestUpdatedAt: Math.max(
          ...sortedScenes.map(s => new Date(s.updated_at ?? s.created_at).getTime())
        ),
        categorySortOrder: Math.min(
          ...sortedScenes.map(s => s.category_sort_order ?? 0)
        ),
      };
    })
    .sort((a, b) =>
      b.latestUpdatedAt - a.latestUpdatedAt ||
      a.categorySortOrder - b.categorySortOrder
    );
}, [filtered]);
```

## Files to change
1. `src/pages/AdminProductImageScenes.tsx`

## Expected result
After this change:
- if you edit a sneakers scene, the **Sneakers** category moves to the top
- inside Sneakers, the edited scene stays first in its subgroup
- newly added scenes also surface correctly because `created_at` / `updated_at` are both recent

## Verification
After implementation, test this exact flow:
1. open `/app/admin/product-image-scenes`
2. edit any scene in a lower category like Sneakers
3. save
4. confirm that category moves to the top
5. expand it and confirm the edited scene is first
