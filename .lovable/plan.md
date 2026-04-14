

# Short Film Video Generation — Critical Issues Found

## Will it work if you try now? **No.** There are two blocking bugs that will cause every shot to fail.

## Issue 1: `action: 'create'` Does Not Exist (Critical — blocks all generation)

The `startGeneration` function in `useShortFilmProject.ts` (line 744) calls:
```typescript
supabase.functions.invoke('generate-video', { body: { action: 'create', ... } })
```

But the `generate-video` edge function only handles three modes:
- **Worker mode** (internal, called by process-queue)
- `action: 'status'` (polling)
- `action: 'recover'` (stuck video recovery)

Any other action hits `throw new Error('Unknown action: create')` at line 514. **Every shot will fail with this error.**

The correct flow used by all other video workflows is: **client → `enqueue-generation` → `process-queue` → `generate-video` (worker mode)**. Short film bypasses this entirely.

## Issue 2: No Credit Deduction

Because short film skips the queue system (`enqueue-generation`), no credits are ever deducted. The `enqueue_generation` DB function handles atomic credit deduction — short film never calls it.

## Issue 3: `getClaims` in `generate-video` Auth (Medium)

The `generate-video` edge function still uses `getClaims` (line 57), which may not be available. This was already fixed in the audio edge functions but missed here. However, since the fix is to route through the queue (which uses service role), this becomes less critical.

## Fix Plan

### 1. Route short film shots through the queue system
Replace the direct `supabase.functions.invoke('generate-video', { action: 'create' })` calls with `enqueueWithRetry()` from `src/lib/enqueueGeneration.ts`, using `jobType: 'video'`. This is the same path all other video workflows use.

**Changes in `src/hooks/useShortFilmProject.ts`:**
- Import `enqueueWithRetry`, `isEnqueueError`, `getAuthToken`, `paceDelay`, `sendWake` from `@/lib/enqueueGeneration`
- In `startGeneration`: replace the `supabase.functions.invoke('generate-video')` call with `enqueueWithRetry({ jobType: 'video', payload: { image_url, prompt, duration, ... }, imageCount: 1, ... })`
- After enqueuing, get the `jobId` from the result and poll `generated_videos` by matching on `project_id` + `shot_index` (or by querying `generation_queue` for the job status)
- Send a single `sendWake()` after enqueuing all shots (use `skipWake: true` for individual enqueues)
- Same fix for `retryShotGeneration`

### 2. Update polling to use queue-aware approach
The current `pollShotCompletion` polls `generated_videos` by `videoId`. Since the queue system creates the `generated_videos` row in worker mode, we need to:
- After enqueuing, poll `generation_queue` for the job status first
- Once the queue job completes, extract the `video_url` from the result
- Or poll `generated_videos` by `project_id` + matching criteria

### 3. Fix `getClaims` in `generate-video` (optional but recommended)
Replace `getClaims` with `getUser` at line 57 for consistency with the audio functions. This only affects the `status` and `recover` actions (which the client still calls for polling).

### Files to change

| File | Change |
|------|--------|
| `src/hooks/useShortFilmProject.ts` | Route `startGeneration` and `retryShotGeneration` through `enqueueWithRetry`, update polling logic |
| `supabase/functions/generate-video/index.ts` | Replace `getClaims` with `getUser` (line 57) |

### Implementation order
1. Fix `startGeneration` to use queue system (fixes both generation and credit deduction)
2. Fix `retryShotGeneration` to use queue system
3. Fix `getClaims` in generate-video
4. Test end-to-end

