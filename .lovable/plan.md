# Disable Short Film (temporary)

Short Film burns the most Kling credits per session (4–6 shots × 1080p Kling v3). Until we re-evaluate pricing / caps, fully disable it end-to-end.

## What changes

### 1. Block the route (frontend)
`src/App.tsx` — replace the `/video/short-film` route element with a redirect to `/app/video` and show a branded toast: *"Short Film is temporarily paused while we upgrade the video engine."*

### 2. Remove user-facing entry points
- `src/pages/VideoHub.tsx` — keep card as `disabled` + `comingSoon` (already is). Update copy to "Temporarily unavailable" so it doesn't promise a future date.
- `src/pages/Dashboard.tsx` (line 213) — hide the "Start a Short Film" outline button (conditional `false` flag or remove until re-enabled).
- `src/pages/features/WorkflowsFeature.tsx` (line 45) — remove the Short Film entry from the public Workflows feature list, OR mark with a "Paused" badge if that grid supports it. Public landing pages should not advertise it.

### 3. Backend safety net (defense in depth)
`supabase/functions/generate-video/index.ts` — at the top of the handler, after parsing payload, reject when `payload.workflow_type === 'short_film'` OR `job_type === 'video_multishot'`:
- Mark the job `failed` with `error_message: "Short Film is temporarily disabled"`.
- Call `refund_credits` RPC for `credits_reserved`.
- Return 200 (so process-queue doesn't retry) with `{ disabled: true }`.

This guarantees any cached client, in-flight retry, or external caller can't drain Kling balance through the short-film path.

### 4. No DB / pricing / sidebar-nav changes
Leave `useShortFilmProject.ts`, the wizard pages, types, and credit pricing intact — re-enabling later is a one-line revert per file.

## Out of scope
- Animate Image, Start & End, Ad Sequence, Consistent Model — untouched.
- Refunding past Short Film failures.
- Switching providers or adding per-user daily caps (separate work).

## Files touched
1. `src/App.tsx`
2. `src/pages/VideoHub.tsx`
3. `src/pages/Dashboard.tsx`
4. `src/pages/features/WorkflowsFeature.tsx`
5. `supabase/functions/generate-video/index.ts`
