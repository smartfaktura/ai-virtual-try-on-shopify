

# Short Film Flow Audit: 1 Critical Bug Found

## Bug: Stale State Causes Project Always Marked "Failed"

**Location**: `src/hooks/useShortFilmProject.ts`, lines 849-851

After `pollQueueJobCompletion` resolves and `setShotStatuses` updates shot statuses to `'complete'`, the code immediately reads `shotStatuses` (the React state variable) to count successes:

```typescript
const currentStatuses = shotStatuses;  // ← STALE! Still has 'processing' values
const successCount = currentStatuses.filter(s => s.status === 'complete').length;
// successCount is always 0 → project always marked 'failed'
```

React state updates from `setShotStatuses` are asynchronous — the closure still holds the old array where every shot is `'processing'`. So `successCount` is always 0, the project is always saved as `'failed'`, and the user always sees "All shots failed" even when the video generated successfully.

**Fix**: Determine success/failure from the `resultUrl` return value (which is already in scope) instead of reading stale state:

```typescript
const allSucceeded = resultUrl !== null;
const projectStatus = allSucceeded ? 'complete' : 'failed';
```

## Everything Else Looks Good

- Multi-shot payload construction with `negative_prompt` — correct
- Kling omni-video request body (`multi_shot: true`, `shot_type: "customize"`, `multi_prompt`) — correct
- Single-shot fallback (< 2 shots → `image2video`) — correct
- Polling with `endpoint: "omni"` for multi-shot tasks — correct
- `video_multishot` routing in `process-queue` — correct
- Cinematic prompt engine (role-based cinematics, tone presets) — correct
- `ShortFilmVideoPlayer` single-video detection — correct
- Credits, refunds, error handling — correct

## Files to Change

| File | Change |
|------|--------|
| `src/hooks/useShortFilmProject.ts` | Lines 849-866: Replace stale `shotStatuses` read with `resultUrl`-based success check |

## Implementation

```typescript
// Replace lines 849-866 with:
const allSucceeded = resultUrl !== null;
const projectStatus = allSucceeded ? 'complete' : 'failed';

// Persist full draft state for reopening
const draftState: DraftState = {
  step: 'review', filmType, storyStructure, references, shots, settings, planMode, customRoles,
};
await supabase.from('video_projects').update({
  status: projectStatus,
  draft_state_json: JSON.parse(JSON.stringify(draftState)),
}).eq('id', currentProjectId!);

if (allSucceeded) {
  toast.success('Short film generation complete!');
} else {
  toast.error('Film generation failed');
}
```

One variable fix that prevents the project from being incorrectly marked as failed every time.

