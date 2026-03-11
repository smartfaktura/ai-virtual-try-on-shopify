

## Fix: Delayed Activity Notification After Try-On Submission

### Root Cause

After enqueuing try-on jobs, the code never calls `queryClient.invalidateQueries` for `workflow-active-jobs`. The Workflows page relies on a 5-second polling interval to discover new jobs. Combined with network latency, this creates the 5-10 second delay before the activity card appears.

### Fix: `src/pages/Generate.tsx`

After successfully enqueuing try-on jobs (both multi-product and single-product paths), immediately invalidate the `workflow-active-jobs` query so the Activity section updates instantly.

Add after the `toast.success` calls in both try-on submission paths (~line 955 for multi-product, and after single-product enqueue completes):

```typescript
queryClient.invalidateQueries({ queryKey: ['workflow-active-jobs'] });
```

This is the same pattern already used for `library` and `recent-creations` queries elsewhere in the file. Single line addition in two locations, no structural changes.

