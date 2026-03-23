

# Fix Steal This Look Preview Modal to Match Discover Page

## Problem
The Dashboard's "Steal This Look" section uses `DiscoverDetailModal` but passes `relatedItems={[]}` and omits key props (`isSaved`, `onToggleSave`, `viewCount`), making the modal feel incomplete compared to the Discover page.

## Changes

### `src/components/app/DashboardDiscoverSection.tsx`

1. **Add related items logic**: Compute `relatedItems` from `allItems` based on the selected item (same scene first, then category similarity) — matching the Discover page's `scoreSimilarity` approach but simplified:

```tsx
const relatedItems = useMemo(() => {
  if (!selectedItem) return [];
  if (selectedItem.type === 'preset' && selectedItem.data.scene_name) {
    const sameScene = allItems.filter(i =>
      i.type === 'preset' &&
      i.data.scene_name === selectedItem.data.scene_name &&
      i.data.id !== selectedItem.data.id
    );
    if (sameScene.length >= 3) return sameScene.slice(0, 9);
  }
  return allItems
    .filter(i => !(i.type === selectedItem.type && /* same id check */))
    .filter(i => i.data.category === selectedItem.data.category)
    .slice(0, 9);
}, [allItems, selectedItem]);
```

2. **Add saved items support**: Import `useSavedItems` hook and pass `isSaved` / `onToggleSave` to the modal.

3. **Pass all missing props** to `DiscoverDetailModal`:
   - `isSaved` — from `useSavedItems`
   - `onToggleSave` — toggle save handler
   - `relatedItems` — computed above
   - `onSelectRelated` — update `selectedItem`

### Files
- `src/components/app/DashboardDiscoverSection.tsx` — add relatedItems computation, saved items support, pass full props to modal

