

## Fix: Robust Generation Cancellation + Progress Feedback

### Problems

1. **Silent cancel failure**: The cancel PATCH in `useGenerationQueue.ts` doesn't check the HTTP response. If the update fails (e.g., job already completed), the UI shows "cancelled" and "credits refunded" but nothing actually happened.
2. **No elapsed time feedback**: When a job takes 60+ seconds (normal for some models), the user has no indication of elapsed time, making it feel "stuck."
3. **Race condition**: If the job completes between the cancel click and the PATCH, the UI lies about the refund.
4. **Credits are fine**: Your job `88210bdc` completed successfully and delivered images. Balance is 2,406 -- no credits were lost.

### Changes

**1. `src/hooks/useGenerationQueue.ts` — Fix cancel with response checking (~line 345-371)**

```typescript
const cancel = useCallback(async () => {
  if (!jobIdRef.current || !activeJob || 
      (activeJob.status !== 'queued' && activeJob.status !== 'processing')) return;

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const { data: session } = await supabase.auth.getSession();
  const token = session?.session?.access_token || SUPABASE_KEY;

  // Check current job status first
  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/generation_queue?id=eq.${jobIdRef.current}&select=status`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` } }
  );
  const [currentJob] = await checkRes.json();
  
  if (!currentJob || currentJob.status === 'completed') {
    // Job already completed — don't cancel, just refresh
    toast.info('Generation already completed!');
    pollJobStatus(jobIdRef.current);
    return;
  }
  if (currentJob.status === 'failed' || currentJob.status === 'cancelled') {
    toast.info('Generation already ended.');
    stopPolling();
    return;
  }

  // Attempt cancel
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/generation_queue?id=eq.${jobIdRef.current}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',  // Get back the updated row
      },
      body: JSON.stringify({ status: 'cancelled' }),
    }
  );
  
  const updated = await res.json();
  if (Array.isArray(updated) && updated.length > 0 && updated[0].status === 'cancelled') {
    stopPolling();
    setActiveJob(prev => prev ? { ...prev, status: 'cancelled' } : null);
    toast.info('Generation cancelled. Credits refunded.');
    refreshBalance();
  } else {
    // Cancel didn't take effect — re-check status
    toast.warning('Could not cancel — generation may have already completed.');
    pollJobStatus(jobIdRef.current!);
  }
}, [activeJob, stopPolling, pollJobStatus]);
```

**2. `src/components/app/QueuePositionIndicator.tsx` — Add elapsed time display**

When status is `processing`, show elapsed time (e.g., "Processing... 45s") so users know it's alive.

```typescript
// Add a timer that counts from job.started_at
const [elapsed, setElapsed] = useState(0);
useEffect(() => {
  if (job?.status !== 'processing' || !job.started_at) return;
  const start = new Date(job.started_at).getTime();
  const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
  tick();
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, [job?.status, job?.started_at]);

// Show: "Processing... 45s" or "Processing... 1m 12s"
```

**3. `src/hooks/useGenerationQueue.ts` — Pass `refreshBalance` from CreditContext**

The cancel function needs to refresh the credit balance after a successful cancellation so the UI updates immediately.

### Files Changed
| File | Change |
|---|---|
| `src/hooks/useGenerationQueue.ts` | Add response checking to cancel, accept `refreshBalance` callback |
| `src/components/app/QueuePositionIndicator.tsx` | Add elapsed time counter during processing |
| `src/pages/Freestyle.tsx` | Pass `refreshBalance` to `useGenerationQueue` |

