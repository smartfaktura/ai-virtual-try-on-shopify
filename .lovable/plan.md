# Brand Models — fix identity match + always return 3 variations

Two bugs in `supabase/functions/generate-user-model/index.ts`:

1. Reference image doesn't drive the face — Gemini 3 Pro Image uses the upload as loose inspiration only.
2. Sometimes 2 of 3 variations come back; failures are silently dropped.

## Fix 1 — Identity-preserving reference mode (Seedream Dual-Reference)

Adopt the same Dual-Reference approach already used in Catalog Studio.

- New helper `generateSingleImageSeedream(prompt, referenceUrl, apiKey)` calling Seedream 4.5 with two image slots: slot A = user's reference (identity anchor), slot B = a plain studio backdrop reference, plus an identity-locking prompt:
  > "Preserve the exact face, skin tone, hair, and bone structure of the person in image 1. Place them in a studio portrait matching the lighting and framing of image 2. Do not alter facial identity."
- Routing in the standard flow:
  - `mode === "reference"` → Seedream Dual-Reference (identity locked).
  - `mode === "combined"` with `imageUrl` → Seedream Dual-Reference, append the description as styling cues (hair color, expression, clothing) but keep identity locked.
  - `mode === "generator"` (no image) → keep current Gemini 3 Pro Image path.
- Fallback chain on Seedream failure: Seedream → Gemini 3 Pro Image with reference inlineData (today's path) → Gemini Flash Image. Same 3-tier defense the rest of the app uses.
- Drop the "analyze with Gemini 2.5 Flash to text" step for pure reference mode — it loses identity. Still run it to fill `metadata` (gender / body_type / ethnicity / age_range / name) for the saved model record, just don't use `appearance_description` to drive the image.

## Fix 2 — Always return 3 variations

Currently:
```
Promise.allSettled(3 calls) → filter fulfilled → return survivors
```

Change to:
- Per-slot retry: each of the 3 slots gets up to 2 attempts (initial + 1 retry with 1.5s backoff). On rate-limit (429), wait the suggested time before retry.
- If after retries a slot still failed, fall back to the next model in the chain for that slot only.
- If 1 or 2 slots still fail at the end, surface a `partial: true` flag and a `failed_count` in the response so the UI can show a small "Re-roll missing variation" button instead of silently showing 2 cards.
- Log every failure with the slot index and error so it shows in edge function logs (today they're swallowed).

## UI touch-ups (`src/pages/BrandModels.tsx`)

- If response has `partial: true`, render an empty 3rd slot with a "Generate one more" button that calls the function again for a single image.
- Keep credit deduction logic unchanged — credits are only spent on save (already correct).

## Out of scope

- No DB schema changes.
- No pricing changes.
- No changes to `create-model-from-image` (separate, used for image-only metadata extraction).

## Risk

- Seedream Dual-Reference for portraits is new — current usage is product/catalog. Worst case: identity is closer but lighting differs slightly from spec; mitigated by the studio-backdrop anchor in slot B and the prompt lock.
- Per-slot retries lengthen worst-case latency by ~10–15s; acceptable for a 20-credit save action.

## Effort

Small-to-medium. ~150 lines in the edge function, ~30 in `BrandModels.tsx`. No migrations. Half a day end-to-end including QA on a real reference upload.
