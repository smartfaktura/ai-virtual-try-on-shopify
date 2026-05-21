# Brand Models — fix identity match + always return 3 variations

Two bugs in `supabase/functions/generate-user-model/index.ts`:

1. Reference image doesn't drive the face — the upload is used as loose inspiration only.
2. Sometimes 2 of 3 variations come back; failures are silently dropped.

## Fix 1 — Make Gemini actually preserve the reference face

Stay on Gemini 3 Pro Image (nano banana family). The problem is not the model, it's how we call it.

Today's reference flow does this:
1. Sends upload to Gemini 2.5 Flash → gets a short text description.
2. Calls Gemini 3 Pro Image with `[image] + [long studio-portrait prompt]` + soft "closely resembles" line.

The long studio prompt (camera, lens, lighting, framing, clothing, background) overrides the identity signal, and the text description re-describes the person in generic terms — so Gemini regenerates a new face that matches the description rather than the photo.

Changes:

- **Drop the Gemini Flash text-description step from the image prompt.** Still run it once to fill saved-model `metadata` (gender / body_type / ethnicity / age_range / name), but do not feed `appearance_description` into the image generator. That paraphrase is what dilutes identity.
- **Rewrite the reference-mode prompt as an identity-lock instruction**, image-first, short and directive:
  > "Use the person in the provided image as the exact subject. Preserve their face, bone structure, skin tone, hair, and eye color with photographic fidelity — this is the same person, not a lookalike. Re-photograph them as a studio portrait: light grey (#E8E8E8) seamless background, soft three-point lighting, 85mm f/2.8, head-and-shoulders, looking at camera, neutral expression, [white t-shirt / white cami top depending on gender]. Do not stylize, do not change age, do not change ethnicity, no AI smoothing."
- **Combined mode** (description + image): same identity-lock prompt, then append only the *styling* fields from the description (hair style/color, expression, facial hair, clothing) — skip ethnicity/age/body type since the photo already encodes them. Order in the request: image part first, then text.
- **Generator mode** (no image): unchanged.

That's the whole identity fix — same model, better prompt and better ordering.

## Fix 2 — Always return 3 variations

Currently: `Promise.allSettled(3 calls)` → filter fulfilled → return survivors. Failures are swallowed.

Changes:

- Per-slot retry: each of the 3 slots gets up to 2 attempts (initial + 1 retry with 1.5s backoff). On 429, wait the retry-after hint before retrying.
- Log every failure with slot index and Gemini error body so it's visible in edge function logs.
- If after retries a slot still failed, return `partial: true` and `failed_count: N` alongside the variations we do have.
- `BrandModels.tsx`: when `partial` is true, render the missing slot as a placeholder with a "Generate one more" button that re-invokes the function for a single image. No extra credits — credits are still only spent on save.

## Out of scope

- No DB schema changes.
- No pricing/credit changes.
- No changes to `create-model-from-image` (separate metadata-only path).

## Risk

- Retries lengthen worst-case latency ~10–15s; acceptable for a 20-credit save action.
- Tightening the prompt may produce slightly less "polished" portraits in exchange for real identity match. That's the trade the user is asking for.

## Effort

Small. ~60 lines in the edge function, ~25 in `BrandModels.tsx`. No migrations. Couple hours including QA with a real reference upload.
