

# Fix Short Film: 2 Bugs

## Bug 1: `job_type` Not Passed to Worker → Wrong Handler

**Root cause**: `process-queue/index.ts` line 133-138 builds `enrichedPayload` from `{ ...payload, user_id, job_id, credits_reserved }` but does NOT include `job_type`. When `generate-video` receives the request, `body.job_type` is `undefined`, so the check `jobType === "video_multishot"` (line 381) fails. It falls through to `handleWorkerMode` which requires `image_url` — causing `"image_url is required in payload"`.

**Fix**: Add `job_type: jobType` to the enriched payload in `process-queue/index.ts`.

```typescript
const enrichedPayload = {
  ...payload,
  user_id: userId,
  job_id: jobId,
  job_type: jobType,        // ← ADD THIS
  credits_reserved: creditsReserved,
};
```

## Bug 2: Per-Shot "Retry" Buttons Make No Sense for Multi-Shot

The UI shows a "Retry" button on each individual shot card. But multi-shot generation is a single combined video — there's no way to retry just one shot. When the film fails, all shots fail together, so the retry should be a single "Retry Film" action, not 4 individual buttons.

**Fix**: In `ShortFilmProgressPanel.tsx`, hide per-shot retry buttons. Instead, show a single "Retry All" button when any shots have failed.

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/process-queue/index.ts` | Add `job_type: jobType` to enriched payload (line 133) |
| `src/components/app/video/short-film/ShortFilmProgressPanel.tsx` | Replace per-shot "Retry" with single "Retry Film" button |

## Deploy

Redeploy `process-queue` after the fix. This is the **actual** reason short film generation fails — the routing bug means every `video_multishot` job hits the wrong handler.

