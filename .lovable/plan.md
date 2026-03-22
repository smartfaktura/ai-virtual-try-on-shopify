

# Fix: Modal Reopens After Clicking X

## Root Cause

When clicking X, `handleClose` calls:
1. `setSelectedItem(null)` — clears the item ✓
2. `window.history.replaceState(null, '', '/app/discover')` — changes URL but **doesn't trigger React Router**

Since React Router's `useParams` still holds the old `urlItemId`, the `useEffect` on line 298-307 fires again and calls `setSelectedItem(found)`, immediately reopening the modal.

Same issue exists in `handleItemClick` (line 391) which uses `window.history.pushState` — this also bypasses React Router.

## Fix

### `src/pages/Discover.tsx`

**`handleClose` (line 395-398)**: Replace `window.history.replaceState` with React Router's `navigate`:
```ts
const handleClose = useCallback(() => {
  setSelectedItem(null);
  navigate('/app/discover', { replace: true });
}, [navigate]);
```

**`handleItemClick` (line 390-393)**: Replace `window.history.pushState` with `navigate`:
```ts
const handleItemClick = (item: DiscoverItem) => {
  navigate(getItemUrl(item));
  setSelectedItem(item);
};
```

**`onSelectRelated` (line 537)**: Same fix — replace `window.history.replaceState` with `navigate`:
```ts
onSelectRelated={(item) => { navigate(getItemUrl(item), { replace: true }); setSelectedItem(item); }}
```

Three URL-navigation calls fixed, all in one file. The `useEffect` watching `urlItemId` will now correctly see the cleared param and won't reopen the modal.

