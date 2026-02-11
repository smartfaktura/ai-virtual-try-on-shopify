

## Fix: Restore Generation Progress After Page Refresh

### Problem

When you refresh the page during a generation, the progress silhouette disappears because `useGenerationQueue` stores the active job only in React memory (`useState`). On refresh, everything resets to `null` and no polling resumes.

### Solution

On mount, check the database for any `queued` or `processing` job belonging to the current user. If one exists, restore it as the `activeJob` and resume polling.

### Changes

#### `src/hooks/useGenerationQueue.ts`

Add a `useEffect` that runs once when the user is available:

1. Query `generation_queue` for any job with `status` in (`queued`, `processing`) for the current user
2. If found, set it as `activeJob` and start polling via `pollJobStatus(jobId)`
3. If not found, do nothing (current behavior)

```text
// New useEffect after existing cleanup effect (line ~56)
useEffect(() => {
  if (!user) return;

  const restoreActiveJob = async () => {
    // Query for any in-progress job
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/generation_queue?user_id=eq.${user.id}&status=in.(queued,processing)&order=created_at.desc&limit=1&select=id,status,priority_score,error_message,created_at,started_at,completed_at`,
      { headers: { apikey, Authorization: `Bearer ${token}` } }
    );

    const rows = await res.json();
    if (rows?.length > 0) {
      const row = rows[0];
      setActiveJob({ id: row.id, status: row.status, ... });
      jobIdRef.current = row.id;
      pollJobStatus(row.id);
    }
  };

  restoreActiveJob();
}, [user]);
```

This query deliberately excludes the `result` column to avoid downloading large base64 payloads. Only `status` and metadata are needed to restore the progress UI.

### What This Fixes

- Page refresh during generation: silhouette and progress bar reappear
- Navigation away and back: progress state restored
- Browser tab close and reopen: picks up where it left off

### Files Changed

| File | Change |
|------|--------|
| `src/hooks/useGenerationQueue.ts` | Add `useEffect` to restore in-progress jobs on mount |

No other files need changes -- the Freestyle page already renders the progress UI based on `activeJob` and `isProcessing` from this hook.

