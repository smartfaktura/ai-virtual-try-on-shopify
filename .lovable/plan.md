

## Fix: Workflow Ignoring User-Selected Aspect Ratio

### Root Cause

Two bugs in `supabase/functions/generate-workflow/index.ts`:

1. **Aspect ratio never passed to the AI model** — The function calculates `aspectRatio` via `getAspectRatioForVariation()` but only stores it for metadata. It never:
   - Adds it to the prompt text (like Freestyle does: `Output aspect ratio: 1:1`)
   - Passes it via `image_config: { aspect_ratio }` in the API call
   - So the AI model guesses output dimensions from the reference image shape → tall product photo = tall output

2. **User's UI selection ignored** — The frontend (`Generate.tsx` line 641-678) never sends the user-selected `aspectRatio` in the payload. The backend only uses the workflow config's `fixed_settings.aspect_ratios[0]`, which defaults to `1:1`. But even that value is never actually enforced in the generation call.

3. **Dimensions in prompt** — Product dimensions ARE injected into the prompt (line 496: `Dimensions: ${product.dimensions} -- render at realistic scale`), so that part works. But it's a secondary issue — the main problem is the output aspect ratio.

### Fix — 2 files

**1. `supabase/functions/generate-workflow/index.ts`**

- In `generateImage()` (line 537): Accept an `aspectRatio` parameter. Add it to the prompt as `\n\nOutput aspect ratio: {ratio}` AND pass `image_config: { aspect_ratio }` in the API body — mirroring exactly what `generate-freestyle` does.
- In the generation loop (line 853-993): Pass the user-selected aspect ratio (from `body.aspectRatio`) as override, falling back to `getAspectRatioForVariation()`.
- Read `body.aspectRatio` from the request payload (already typed in `WorkflowRequest` or add it).

**2. `src/pages/Generate.tsx`**

- In `handleWorkflowGenerate()` payload (line 641-678): Add `aspectRatio` to the payload so the user's selection is sent to the backend.

### What Changes

| Before | After |
|---|---|
| AI model guesses output size from reference image | Explicit `Output aspect ratio: 1:1` in prompt + `image_config` parameter |
| User picks 1:1 in UI, backend ignores it | `aspectRatio` sent in payload, backend uses it as override |
| Tall product photo → tall output | Tall product photo → 1:1 output (as selected) |

