

# Fix: Deleted Discover Presets Still Showing to Other Users

## Root Cause
In `useDiscoverPresets.ts`, the realtime subscription only listens for `INSERT` events (line 35). When admin deletes a preset, the `DELETE` event is not captured, so other users' cached query data (with `staleTime: 10 * 60 * 1000` = 10 minutes) is never invalidated. They keep seeing deleted items until they refresh or the cache expires.

## Fix

### `src/hooks/useDiscoverPresets.ts`

Change the realtime event filter from `'INSERT'` to `'*'` (all events: INSERT, UPDATE, DELETE). This ensures that when admin deletes or updates a preset, all connected clients invalidate their cache and refetch.

```ts
// Line 35: Change 'INSERT' → '*'
{ event: '*', schema: 'public', table: 'discover_presets' }
```

Single line change. All other logic stays the same.

### Files
- `src/hooks/useDiscoverPresets.ts` — line 35

