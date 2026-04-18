
## Goal
Replace the variable Short Film pricing with a flat **40 credits per generation**, end-to-end (frontend display + server enforcement). This eliminates the drift between client-side `videoCreditPricing.ts` (per-shot + audio + voice add-ons) and the server's flat `25` for `video_multishot`.

## Does this fix the audit problem?
**Yes — for Short Film specifically.** A flat rate means the server and client agree by definition; no add-on math to drift. The other discrepancies from the audit (Animate `motionRecipe` mismatch, Ad Sequence / Consistent Model under-pricing) remain — but you asked only about Short Film, so this plan stays scoped there.

## Changes

### 1. Server — `supabase/functions/enqueue-generation/index.ts`
In `calculateCreditCost`, the video branch:
```ts
if (jobType === "video_multishot") return 40;
```
(currently returns flat `25`). Leave single-shot `video` logic unchanged.

### 2. Frontend — Short Film cost display
Files that compute Short Film cost via `VIDEO_CREDIT_RULES.shortFilm` or sum per-shot:
- `src/config/videoCreditPricing.ts` — add a `SHORT_FILM_FLAT_COST = 40` export (keep old rules for reference but unused).
- Any Short Film review/summary component that currently sums shots × duration + audio (likely `src/components/app/video/short-film/ShortFilmReview.tsx` or similar — I'll grep for `shortFilm` usage and replace the calc with the flat constant).
- The estimate shown in Step 6 / generation CTA → "40 credits".

### 3. No DB migration needed
`enqueue_generation` RPC just receives the cost from the edge function — server change alone is authoritative.

## Out of scope
- Animate / Ad Sequence / Consistent Model pricing fixes (separate follow-up).
- Refund logic (already correct).
- Short Film internal shot/audio config (only the price label changes).

## Verification after build
1. Trigger a Short Film generation → confirm exactly **40 credits** deducted regardless of shot count, audio, voice, or duration.
2. Confirm the Step 6 review screen shows "40 credits".
3. Confirm cancellation refunds 40.
