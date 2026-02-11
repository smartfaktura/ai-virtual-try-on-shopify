

## Fix: Resume In-Flight Generations After Page Refresh

### Problem
The `useGenerationQueue` hook stores the active job ID in React state (`useState`). When the page is refreshed:
1. State is cleared -- `activeJob` becomes `null`
2. Polling stops -- no `setInterval` running
3. The backend finishes the job, but nobody is listening
4. The generated image is never shown to the user

### Solution
On mount, check for any recent `queued` or `processing` jobs belonging to the current user, and automatically resume polling for them.

### Changes

#### `src/hooks/useGenerationQueue.ts`

**Add a recovery effect** that runs once on mount (when `user` is available):

```typescript
// Recover in-flight jobs after page refresh
useEffect(() => {
  if (!user || activeJob) return; // Don't recover if already tracking a job

  const recover = async () => {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token || SUPABASE_KEY;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/generation_queue?user_id=eq.${user.id}&status=in.(queued,processing)&order=created_at.desc&limit=1`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) return;
    const rows = await res.json();
    if (rows.length === 0) return;

    const row = rows[0];
    jobIdRef.current = row.id;
    pollJobStatus(row.id);
  };

  recover();
}, [user]); // intentionally minimal deps -- run once per user login
```

This will:
- Query the `generation_queue` table for any active jobs on page load
- If found, resume polling that job until it completes or fails
- The existing completion handler in `Freestyle.tsx` picks up the result and saves images as normal

#### No other files need to change
The `Freestyle.tsx` effect that watches `activeJob.status === 'completed'` already handles saving images and showing results. The recovery just reconnects the polling pipeline.

### Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| Refresh during generation | Recovers job, resumes polling, shows result |
| Refresh after completion | No in-flight jobs found, no recovery needed |
| Multiple tabs | Each tab recovers the same job, but `saveImages` is idempotent |
| Job times out (5 min) | `cleanup_stale_jobs` marks it failed, polling picks up failure state |

### Files Changed

| File | Change |
|------|--------|
| `src/hooks/useGenerationQueue.ts` | Add recovery effect to resume polling for in-flight jobs on mount |

