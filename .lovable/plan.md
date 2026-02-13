

## Fix: Side Profile Framing Not Working

### Problem
When "Side Profile" is selected, the generated image ignores the framing entirely (showing a front-facing model with a backpack). This happens because the `side_profile` framing prompt is **missing** from the edge function's prompt mapping.

The `framingPrompts` dictionary in the `generate-freestyle` edge function includes all 7 other framing options but omits `side_profile`. When the framing value doesn't match any key, the prompt injection is skipped entirely.

### Solution
Add the `side_profile` entry to the `framingPrompts` dictionary in the edge function, matching the same prompt pattern already defined in `src/lib/framingUtils.ts`.

### Changes

**File: `supabase/functions/generate-freestyle/index.ts`**
- Add `side_profile` to the `framingPrompts` object (around line 158) with the prompt:
  `"FRAMING: Side profile view focusing on the ear and jawline area. Show the side of the head from temple to jawline. The product should be clearly visible on or near the ear."`
- Also add `side_profile` to the `noFaceFramings` array (currently only `hand_wrist`, `lower_body`, `back_view`) so the model identity logic doesn't force a face-forward composition.

Both changes are single-line additions to existing code blocks. The edge function will be automatically redeployed.

