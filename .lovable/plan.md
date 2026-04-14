

# Short Film Multi-Shot Audit: Issues Found

## Status: 3 bugs found, prompts are well-configured

### Bug 1: `negative_prompt` is never sent to Kling

The `buildShotPrompt` function returns both `prompt` and `negative_prompt`, but the multi-shot payload (line 781) only extracts `prompt`:

```typescript
const { prompt } = buildShotPrompt(shot, { ... }, imageIdx);
// negative_prompt is discarded!
```

The Kling omni-video API supports `negative_prompt` at the top level. Currently it's never included in the request body (line 229-238). This means all the carefully crafted negative prompts ("blurry, low quality, watermark..." plus role-specific negatives) are completely wasted.

**Fix**: Extract `negative_prompt` from the first shot (or combine all), pass it in the payload, and add it to `klingBody` in the edge function.

### Bug 2: Kling multi-shot requires minimum 2 shots

The edge function validates `shots.length < 1` (line 218), but Kling's omni multi-shot API requires **minimum 2 shots**. If a user configures a 1-shot film, it will fail at the Kling API level with an unclear error.

**Fix**: Add validation — if only 1 shot, fall back to standard `image2video` endpoint instead of multi-shot.

### Bug 3: `generated-videos` bucket is private — `getPublicUrl` returns inaccessible URLs

The `generated-videos` storage bucket is set to `Is Public: No`. The status handler (line 84-87) calls `getPublicUrl()` on this private bucket, which returns a URL that won't resolve for the client. The video player will fail to load the video.

This is actually an **existing** bug that affects all video generation, not just multi-shot. The workaround would be to use signed URLs, but this may already be handled elsewhere. I'll flag it but not fix it in this scope since single-shot video apparently works for the user.

### Prompt Engine Review: Looks Good

The cinematic prompt builder is well-structured:
- All 14 roles have specific cinematographic directives (hook, reveal, detail, closing, etc.)
- Tone presets cover all 8 film types
- `<<<image_N>>>` references are correctly injected when images exist
- Camera motion, subject motion, preservation strength, and aspect ratio hints are all included
- The prompt composition order is logical: tone → image ref → directive → purpose → lighting → lens → motion → script line → preservation → aspect → quality footer

### Files to Change

| File | Change |
|------|--------|
| `src/hooks/useShortFilmProject.ts` | Extract and pass `negative_prompt` in multi-shot payload |
| `supabase/functions/generate-video/index.ts` | Add `negative_prompt` to Kling request body; validate min 2 shots with fallback to single-shot |

### Implementation Detail

**1. Pass negative_prompt in payload** (`useShortFilmProject.ts`):
```typescript
// Collect negative_prompt from first shot (they share base negatives)
const { negative_prompt } = buildShotPrompt(shots[0], { filmType, tone, settings, references });

payload: {
  shots: multishotPayload,
  negative_prompt,   // ← ADD
  ...
}
```

**2. Include in Kling body** (`generate-video/index.ts`):
```typescript
const negativePrompt = body.negative_prompt as string;
if (negativePrompt) {
  klingBody.negative_prompt = negativePrompt;
}
```

**3. Single-shot fallback** (`generate-video/index.ts`):
```typescript
if (shots.length < 2) {
  // Fall back to standard image2video for single shot
  // Use shots[0].prompt with standard endpoint
}
```

Or alternatively, enforce minimum 2 shots on the frontend by disabling generation when `shots.length < 2`.

