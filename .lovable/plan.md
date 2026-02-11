

## Fix: Generation Stuck on "Generating" Due to Heavy Polling Payload

### Root Cause

The `pollJobStatus` function in `useGenerationQueue.ts` fetches the `result` column from `generation_queue` every 3 seconds. This column contains base64-encoded image data (1.8MB+ per image). On slower connections or with high-quality/multi-image jobs, these polling requests timeout or fail silently, so the UI never learns the job completed -- it stays stuck on "Generating your images..."

This is the same root cause as the gallery issue: fetching massive base64 blobs over REST.

### Solution

Split polling into two phases:
1. **Poll lightweight status only** (no `result` column) -- fast, reliable, every 3 seconds
2. **Fetch `result` once** only when status transitions to `completed`

### Changes to `src/hooks/useGenerationQueue.ts`

**1. Remove `result` from the polling select statement**

Change line 109 from:
```
select=id,status,result,error_message,created_at,started_at,completed_at,priority_score
```
to:
```
select=id,status,error_message,created_at,started_at,completed_at,priority_score
```

Set `result: null` in the constructed `QueueJob` object during polling.

**2. Add a one-time result fetch when job completes**

When polling detects `status === 'completed'`, make a single fetch for the `result` column, then update `activeJob` with the full result. This happens once, not every 3 seconds.

```typescript
// Inside the poll function, after detecting terminal status:
if (job.status === 'completed') {
  // Fetch result only once
  const resultRes = await fetch(
    `${SUPABASE_URL}/rest/v1/generation_queue?id=eq.${jobId}&select=result`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (resultRes.ok) {
    const resultRows = await resultRes.json();
    if (resultRows?.[0]?.result) {
      job.result = resultRows[0].result;
    }
  }
}
```

**3. Stop polling before the result fetch** so there are no competing requests.

### Result

- Polling requests drop from ~1.8MB to ~200 bytes each
- No more silent timeouts causing the UI to stay stuck
- The result is fetched exactly once when the job completes
- The existing completion handler in `Freestyle.tsx` works as before

| File | Change |
|------|--------|
| `src/hooks/useGenerationQueue.ts` | Remove `result` from poll select; fetch result once on completion |

