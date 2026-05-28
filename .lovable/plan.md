## Simpler approach

Drop the duplicate `[CASE ARTWORK LOCK]` anchor idea. Generations *do* sometimes come out correct — the variance suggests the case reference is just losing attention priority, not that we need a second copy of it. Two small changes only:

### 1. Put the product reference first in the references array

In `supabase/functions/generate-workflow/index.ts` (and the native Gemini path for phone cases), when building the multi-image payload for Gemini 3 Pro:

- Current order: `[MODEL IMAGE]` first (when present), then `[PRODUCT IMAGE]`, then any extras.
- New order for **phone cases**: `[PRODUCT IMAGE]` always first, then `[MODEL IMAGE]`, then extras.

The first image in a Gemini multi-image request gets the strongest visual anchoring. When the model image is first, the case becomes "an object the person is holding"; when the case is first, the model becomes "a person holding this exact object". This alone is responsible for a large share of the drift we're seeing on selfie/hand-held scenes.

### 2. One strong final reference line

At the very end of the assembled prompt (after `AVOID:`, last thing the model reads), append a single sentence for phone cases:

> `FINAL REMINDER: The phone case in the output must be a literal visual copy of [PRODUCT IMAGE]. The case artwork, stripes, colors, camera cutout shape, lens count, and lens positions in [PRODUCT IMAGE] are not suggestions — they are the exact case to render. Do not redesign them.`

That's it — no duplicate anchor, no removing existing fidelity block, no two-pass pipeline.

### Verify

Re-generate the Orange Striped iPhone Case across "Poolside Case Rest", "Lace Case Selfie", "Soft Mirror Case" and confirm the stripe rhythm and 3-lens triangular island match the reference.

## Files touched

- `supabase/functions/generate-workflow/index.ts` — reorder references for phone cases, append final reminder.
- `src/lib/productImagePromptBuilder.ts` — append the same final reminder so local-built prompts match.
- `public/version.json` — bump.

## What this will NOT touch

- No duplicate references, no case-artwork-lock label.
- No changes to the existing `PHONE CASE FIDELITY` block (it stays as-is).
- No model forcing, no scene-template edits, no two-pass pipeline, no UI changes.
