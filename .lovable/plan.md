

## Fix: Loading State After Refresh + Recover Completed Jobs

### Three Issues Found

**Issue 1: No loading silhouette after refresh**
The recovery effect (line 59-89 in `useGenerationQueue.ts`) runs asynchronously -- it fetches the job from the database, but `activeJob` stays `null` until the first poll response returns. During this gap (could be 500ms-2s), the UI shows the empty state instead of the loading silhouette.

**Issue 2: Slower generation times**
From the database logs, the speed depends entirely on how many images are attached:
- No images: 10-17 seconds
- With source + model + scene images (3 large base64 payloads): 60-140 seconds

This is the AI model's processing time -- not something we can fix in code. The more reference images sent, the longer it takes. This is expected behavior.

**Issue 3: Completed job not visible after refresh**
The recovery only queries for `status=in.(queued,processing)`. If a job completes during the brief refresh window, recovery finds nothing, and the result is never displayed. The images are saved to the database by the backend, but the UI never triggers the `saveImages` flow in `Freestyle.tsx`.

---

### Solution

#### Change 1: Immediate placeholder during recovery (`useGenerationQueue.ts`)

Before calling `pollJobStatus`, immediately set a placeholder `activeJob` so the UI shows the loading silhouette right away:

```typescript
// In recovery effect, after finding a row:
const row = rows[0];
jobIdRef.current = row.id;

// Set immediate placeholder so UI shows loading state instantly
setActiveJob({
  id: row.id,
  status: row.status,  // 'queued' or 'processing'
  position: 0,
  priority: row.priority_score || 0,
  result: null,
  error_message: null,
  created_at: row.created_at,
  started_at: row.started_at,
  completed_at: null,
});

pollJobStatus(row.id);
```

#### Change 2: Also recover recently completed jobs (`useGenerationQueue.ts`)

Expand the recovery query to also look for jobs that completed in the last 2 minutes, so results aren't lost during a refresh:

```
status=in.(queued,processing,completed)&completed_at=is.null,completed_at=gte.{2_minutes_ago}
```

For completed jobs found during recovery, skip polling and directly fetch the result so the completion handler in `Freestyle.tsx` can save the images.

---

### Files Changed

| File | Change |
|------|--------|
| `src/hooks/useGenerationQueue.ts` | Set immediate placeholder activeJob during recovery; expand recovery to include recently completed jobs |

### Regarding Slow Generation

The generation speed (60-140s) is normal when attaching 3 reference images (product, model, scene). The AI model needs more time to process multiple image inputs. Standard text-only prompts still complete in 10-17 seconds. No code change needed for this -- it's the expected behavior of the underlying AI model.
