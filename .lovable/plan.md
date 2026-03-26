

# Fix Camera Orbit — Prompt-Only Approach for Kling v3

## Problem
The previous fix added `STRUCTURED_CAMERA_MOTIONS` (line 59) which **suppresses camera text from the prompt** for orbit, push-in, pan, and drift. But since Kling v3 rejects structured `camera_control`, the result is **no camera instruction at all** — the model defaults to rotating the subject.

## Fix (2 files)

### 1. `src/lib/videoPromptTemplates.ts`

- **Remove** the `STRUCTURED_CAMERA_MOTIONS` set and the suppression logic in `buildCameraClause` — always emit camera text
- **Rewrite the orbit phrase** to be much more explicit that the **camera** moves, not the subject:

```
orbit: 'The camera physically orbits around the subject in a smooth arc. 
The subject stays completely still and fixed in place — only the camera 
moves. The viewing angle changes progressively as the camera circles 
around. The subject does NOT rotate or spin.'
```

- Improve other phrases similarly to emphasize "camera moves, subject stays still"

### 2. `src/lib/videoStrategyResolver.ts`

- Remove `camera_control_config` from the strategy output (set to `undefined` always) since kling-v3 doesn't support it
- Keep the resolver clean — no dead code

### 3. `supabase/functions/generate-video/index.ts`

- Remove the `camera_control` pass-through code added in the previous fix, since we're going prompt-only

This is a revert of the structured camera_control approach, replaced with stronger prompt engineering that explicitly tells the model "camera moves, subject stays fixed."

