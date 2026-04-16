

# Add Feedback Card to Missing Workflow Pages

## Problem
1. **Perspectives** (`/app/perspectives`) has no `ContextualFeedbackCard` at all — it redirects to library after generation
2. **Generate.tsx workflows** (selfie-ugc-set, flat-lay-set, mirror-selfie-set, interior-exterior-staging) — the card exists but `resultId={activeJob?.id}` may be `undefined` after batch completion resets the queue, causing a global dismiss key that blocks future surveys in the same session

## Fix

### 1. `src/pages/Generate.tsx`
- Store the last completed job ID in state (similar to the Freestyle fix) so the feedback card always has a valid `resultId`
- When `currentStep` transitions to `'results'`, capture the job ID into `completedFeedbackJobId` state
- Pass `resultId={completedFeedbackJobId}` instead of `resultId={activeJob?.id}`

### 2. `src/pages/Perspectives.tsx`
- Import `ContextualFeedbackCard`
- Add it to the `genAllDone && genCompletedCount > 0` block, right before the "View in Library" button
- Use the first completed job ID as `resultId`
- Workflow: `"perspectives"`, question: `"Are these angles useful for your product?"`
- Reason chips: `['Angles too similar', 'Product not preserved', 'Quality too low', 'Missing key angle', 'Background issues', 'Other']`

| File | Change |
|------|--------|
| `src/pages/Generate.tsx` | Store completed job ID in state, pass to feedback card instead of `activeJob?.id` |
| `src/pages/Perspectives.tsx` | Add `ContextualFeedbackCard` in the generation-complete view |

