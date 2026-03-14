

## Clearer Batch Progress for Multi-Variation Workflows (Mirror Selfie etc.)

### Problem

When generating 3 Mirror Selfie variations, the progress UI shows:
- `"Creating Mirror Selfie Set..."` + `"Generating 3 variations of 'Product Name'"`
- Batch tracker: `"Image 1 of 3 generating..."` with `"0 images ready"`

This is vague — the user can't tell which variation is being worked on, which are done, and which are queued. The word "Image" is also misleading since each job generates a variation/scene, not just a single image.

### Changes

**`src/pages/Generate.tsx`** — Improve the batch progress section (lines 3887–3906):

1. **Use workflow-aware labels instead of "Image X of Y"**:
   - For scene-based workflows (Mirror Selfie, Interior Staging already handled): show `"Variation X of Y"` instead of `"Image X of Y"`
   - When `allDone`: `"All 3 variations complete"` instead of `"All 3 batches complete"`

2. **Show per-variation status chips** below the progress bar — small inline badges showing each selected variation label with a check, spinner, or pending dot:
   ```
   ✓ Hair Salon  ⟳ Hotel Lobby  ○ Entryway
   ```
   This uses `variationStrategy.variations` filtered by `selectedVariationIndices`, cross-referenced with `batchState.jobs` status.

3. **Show completed image count more clearly**: `"2 of 3 done · 2 images ready"` instead of just `"0 images ready"`

### Implementation Detail

The batch progress section currently uses generic text. We'll:
- Check if `hasWorkflowConfig && variationStrategy` to determine if we should show variation labels
- Map `batchState.jobs` array (ordered by variation index) to the corresponding variation label from `variationStrategy.variations`
- Render small status chips with `CheckCircle` / `Loader2` / `Circle` icons matching the existing design language

Only one file changes: `src/pages/Generate.tsx` (the batch progress rendering block, ~20 lines).

