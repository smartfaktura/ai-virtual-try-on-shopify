

## Fix: Workflow Results Not Appearing in Library Instantly

### Root Cause
When workflow generations complete on the Generate page, the code never tells the Library cache to refresh. The freestyle generation hook (`useGenerateFreestyle.ts`) correctly calls `queryClient.invalidateQueries({ queryKey: ['library'] })` after completion, but the Generate page's two completion handlers (single-job for Try-On, and batch for workflows) do not.

The Library uses `staleTime: 60_000` (60 seconds) and only auto-refreshes on window focus, so new workflow images don't appear for up to 5 minutes unless the user manually navigates away and back.

### Fix (single file)
**File: `src/pages/Generate.tsx`**

1. Get `queryClient` via `useQueryClient()` (already imported from `@tanstack/react-query` on line 5)
2. Add `queryClient.invalidateQueries({ queryKey: ['library'] })` in both completion handlers:
   - **Single-job completion** (~line 650, after `toast.success`): for Try-On results
   - **Batch completion** (~line 675-677, after `toast.success` / `toast.warning`): for workflow scene results

This mirrors what `useGenerateFreestyle.ts` already does on line 146.

### What This Changes
- When a user completes any workflow generation and later navigates to Library, the data will already be fresh
- If the user is already on the Library page, the next render will trigger a refetch immediately
- No polling or realtime subscription needed -- simple cache invalidation is sufficient

### Technical Detail

```text
// In the single-job completion effect (~line 650):
toast.success(...);
refreshBalance();
+ queryClient.invalidateQueries({ queryKey: ['library'] });
+ queryClient.invalidateQueries({ queryKey: ['recent-creations'] });
resetQueue();

// In the batch completion effect (~line 675-677):
toast.success(...) / toast.warning(...);
refreshBalance();
+ queryClient.invalidateQueries({ queryKey: ['library'] });
+ queryClient.invalidateQueries({ queryKey: ['recent-creations'] });
resetBatch();
```

Both `library` and `recent-creations` query keys are invalidated, matching the pattern used by freestyle generations.

