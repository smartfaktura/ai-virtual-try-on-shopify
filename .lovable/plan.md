

# Fix "Similar" Button in Steal This Look to Pass Context to Discover

## Problem
When clicking "Similar" in the Dashboard's Steal This Look modal, it navigates to `/app/discover` without passing the selected item's scene info. The Discover page uses `similarTo` state to filter, but since it's a fresh navigation, that state is empty.

## Solution
Pass the scene name as a URL query parameter when navigating, and have the Discover page read it on mount to initialize the `similarTo` filter.

## Changes

### 1. `src/components/app/DashboardDiscoverSection.tsx` (line 249-251)
Update `onSearchSimilar` to pass scene context via URL:
```tsx
onSearchSimilar={() => {
  if (!selectedItem) return;
  const sceneName = selectedItem.type === 'preset' ? selectedItem.data.scene_name : selectedItem.data.name;
  setSelectedItem(null);
  navigate(`/app/discover${sceneName ? `?similar=${encodeURIComponent(sceneName)}` : ''}`);
}}
```

### 2. `src/pages/Discover.tsx`
On mount, read `?similar=` from URL search params. If present, find the matching item from `allItems` and set it as `similarTo`:

```tsx
// After allItems is populated, check URL for similar param
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const similarScene = params.get('similar');
  if (similarScene && allItems.length > 0 && !similarTo) {
    const match = allItems.find(i =>
      (i.type === 'preset' ? i.data.scene_name : i.data.name) === similarScene
    );
    if (match) {
      setSimilarTo(match);
      // Clean up URL
      params.delete('similar');
      navigate({ search: params.toString() }, { replace: true });
    }
  }
}, [allItems, location.search]);
```

### Files
- `src/components/app/DashboardDiscoverSection.tsx` — pass scene name in URL
- `src/pages/Discover.tsx` — read `similar` param on mount, initialize filter

