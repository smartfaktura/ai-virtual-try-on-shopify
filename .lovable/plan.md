
## Instant Discover Updates After Approval

### Problem
When an admin approves a submission, the new item only appears in the admin's own Discover feed (via React Query cache invalidation). Other users won't see it until they refresh the page or navigate away and back.

### Solution
Enable Realtime on the `discover_presets` table and add a subscription in `useDiscoverPresets` that automatically invalidates the query cache whenever a new preset is inserted. This ensures all connected users see new items instantly.

### Changes

#### 1. Database Migration
Enable Realtime for the `discover_presets` table:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.discover_presets;
```

#### 2. Update `src/hooks/useDiscoverPresets.ts`
Add a Realtime subscription that listens for `INSERT` events on `discover_presets` and calls `queryClient.invalidateQueries({ queryKey: ['discover-presets'] })` when triggered. This will cause all users' Discover pages to automatically refetch the latest data within seconds of an approval.

The hook will set up the subscription via `useEffect`, subscribing on mount and cleaning up on unmount.

### Result
- Admin approves a submission
- New row inserted into `discover_presets`
- Realtime broadcasts the INSERT event to all connected clients
- Each client's `useDiscoverPresets` hook invalidates the cache and refetches
- New item appears in everyone's Discover feed within 1-2 seconds, no refresh needed
