

# Fix: Video Stuck Showing "Queued" When Actually Processing

## Root Cause
`useVideoProject.ts` syncs `pipelineStage` when `generateVideo.status` changes to `queued`, `complete`, or `error` — but **never syncs when it becomes `processing`**. The `pipelineStage` stays permanently stuck at `'queued'`.

In `AnimateVideo.tsx`, the UI checks `videoStatus === 'queued' || pipelineStage === 'queued'` — so the stale `pipelineStage` keeps the UI showing "Queued" even though the backend is actively generating.

## Fix

### File: `src/hooks/useVideoProject.ts` (~line 210)
Add a sync rule: when `generateVideo.status` transitions to `'processing'`, update `pipelineStage` from `'queued'` back to `'generating'`:

```typescript
if (generateVideo.status === 'processing' && pipelineStage === 'queued') {
  setPipelineStage('generating');
}
```

This single line fix ensures the pipeline stage correctly follows the backend job lifecycle, and the UI will show "Generating your video..." with elapsed time instead of being stuck on "Queued".

### File: `src/pages/video/AnimateVideo.tsx` (~line 362)
Also tighten the stage message logic to prioritize `videoStatus` over `pipelineStage`:

```typescript
if (videoStatus === 'queued' && pipelineStage !== 'generating') {
  // Only show "Queued" when videoStatus is truly queued
}
```

This provides defense-in-depth so the UI can never get stuck showing "Queued" when the actual video status has progressed.

## Files Modified
- `src/hooks/useVideoProject.ts` — add processing→generating sync
- `src/pages/video/AnimateVideo.tsx` — tighten stage message condition

