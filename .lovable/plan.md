

# Debug Short Film: Polling Endpoint Bug + Cinematic Prompt Engine

## Bug: Status Polling Uses Wrong Kling Endpoint

**Root cause**: `pollQueueJobCompletion` (line 1032 of `useShortFilmProject.ts`) calls the `status` action without passing `endpoint: "omni"`. The multishot worker stores `{ endpoint: "omni" }` in the queue result, but the polling code never reads it. The edge function defaults to `image2video` endpoint (line 356), which will return a "not found" error for omni tasks — so the video will never be detected as complete.

**Fix**: Read `endpoint` from queue result in phase 1, pass it to the status call in phase 2.

```typescript
// Line 1032 — add endpoint param
body: { action: 'status', task_id: klingTaskId, queue_job_id: jobId, endpoint },
```

## Bug: Kling Omni `duration` in multi_prompt

The `multi_prompt` items send `duration` as a `String` (line 226), but the outer `duration` is also `String(totalDuration)`. Need to verify Kling omni expects string or number for per-shot durations — the current implementation looks correct per Kling docs (string), but we should ensure consistency.

## Enhancement: Cinematic Prompt Engine

Current prompts are functional but generic. Each shot gets something like:
> "Cinematic sleek, premium, high-energy reveal video. This is the attention-grabbing opening shot. Start with visual intrigue. Shot captures the viewer's attention. Scene type: product hero. Camera motion: slow push."

This doesn't produce truly cinematic results. The fix is to rewrite `buildShotPrompt` with:
- **Specific cinematographic language** (lighting, depth of field, lens type, color grading)
- **Shot-specific modifiers** per role (e.g., hook shots get dramatic lighting, detail shots get macro lens language)
- **Negative prompts** tuned per shot type
- **Kling-optimized keywords** that the model responds well to

## Files to Change

| File | Change |
|------|--------|
| `src/hooks/useShortFilmProject.ts` | Fix `pollQueueJobCompletion` to read `endpoint` from queue result and pass to status call |
| `src/lib/shortFilmPromptBuilder.ts` | Rewrite prompt engine with cinematographic language, per-role lighting/lens/grading directives, and better negative prompts |
| `src/components/app/video/short-film/ShortFilmVideoPlayer.tsx` | Add single-video mode: when all clips share the same URL, play once instead of sequencing |

## Prompt Engine Detail

New `buildShotPrompt` will compose prompts like:

> "Cinematic 4K commercial film. Anamorphic lens, shallow depth of field. Dramatic rim lighting with warm golden tones. Slow push-in camera movement revealing a luxury product on a dark reflective surface. Smooth dolly motion, studio-quality lighting. Product fills center frame with precise focus. Rich color grading with deep shadows and lifted highlights."

Each role gets specific additions:
- **hook**: "dramatic opening, high contrast, silhouette to reveal transition"
- **detail**: "extreme macro, rack focus, texture-revealing side light, f/2.8 bokeh"
- **lifestyle**: "natural light, warm color palette, candid human interaction, environmental context"
- **closing**: "elegant pullback, logo-safe composition, fade-ready framing"
- **atmosphere**: "abstract shapes, light play, lens flare, environmental mood"

