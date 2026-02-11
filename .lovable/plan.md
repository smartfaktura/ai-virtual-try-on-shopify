

## Three Quick Fixes: Toast, Selfie Pose, and Time Estimates

---

### Fix 1: Remove "Generation started!" toast

The blue toast notification in `src/hooks/useGenerationQueue.ts` (line 215) fires every time a generation is enqueued. It adds noise since the user already sees the loading state in the UI.

**Change**: Remove the `toast.info('Generation started!')` call. Keep the queue position toast (`Your generation is #X in queue`) since that provides useful info when there's a wait.

**File**: `src/hooks/useGenerationQueue.ts`

---

### Fix 2: Fix selfie prompt -- no "two hands" poses

The current selfie composition prompt (line 91 in `generate-freestyle/index.ts`) says "Arm-length or close-up distance" but doesn't explicitly tell the AI that one hand is holding the phone. This causes the AI to generate poses where the subject has both hands visible (e.g., holding a tennis racket with both hands), which breaks the selfie illusion.

**Change**: Add explicit instructions to the SELFIE COMPOSITION layer:
- "One hand is holding the smartphone to take the photo -- this hand should NOT be visible or only partially visible at the frame edge"
- "The other hand can be relaxed, touching hair, holding a product, or gesturing naturally"
- "NEVER show both hands free or both hands holding objects -- one hand is always occupied with the phone"

**File**: `supabase/functions/generate-freestyle/index.ts`

---

### Fix 3: Harmonize time estimates

Two different components show conflicting estimates:
- `QueuePositionIndicator.tsx` line 54: "This may take a minute"
- `FreestyleGallery.tsx` line 108: "Usually 10-20s"

**Change**: Update both to use consistent, optimistic language:
- QueuePositionIndicator: "Usually takes a few seconds"
- FreestyleGallery: "Wrapping up shortly"

This keeps the meaning aligned (it'll be quick) without using identical words.

**Files**: `src/components/app/QueuePositionIndicator.tsx`, `src/components/app/freestyle/FreestyleGallery.tsx`

---

### Technical Summary

| File | Change |
|------|--------|
| `src/hooks/useGenerationQueue.ts` | Remove `toast.info('Generation started!')` on line 215 |
| `supabase/functions/generate-freestyle/index.ts` | Add one-hand-on-phone constraint to SELFIE COMPOSITION layer |
| `src/components/app/QueuePositionIndicator.tsx` | Change "This may take a minute" to "Usually takes a few seconds" |
| `src/components/app/freestyle/FreestyleGallery.tsx` | Change "Usually 10-20s" to "Wrapping up shortly" |

