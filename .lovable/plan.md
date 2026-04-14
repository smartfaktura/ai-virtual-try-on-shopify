

# Fix Build Error: Missing `pollMultishotCompletion`

## Problem
Line 820 of `useShortFilmProject.ts` calls `pollMultishotCompletion(result.jobId, 90)` but this function was never created. The existing `pollQueueJobCompletion` (line 1003) does exactly what's needed — polls `generation_queue` for the job, then polls Kling status via the `generate-video` edge function.

## Fix

### File: `src/hooks/useShortFilmProject.ts`

**Line 820**: Replace `pollMultishotCompletion` with `pollQueueJobCompletion`.

```typescript
// Before:
const resultUrl = await pollMultishotCompletion(result.jobId, 90);

// After:
const resultUrl = await pollQueueJobCompletion(result.jobId, 90);
```

One line change, zero new files.

