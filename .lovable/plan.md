# Fix "SAFETY_BLOCKED:OTHER" on /app/brand-scenes/new

## Root cause

In `src/features/brand-scenes/prompt/assembleSceneDirective.ts`:

- **Line 284** — `"Do not render text, captions, logos, watermarks, UI chrome, or extra products."`
- **Line 320** (ROLE) — `"... No text, captions, logos, watermarks, or UI chrome."`

Gemini 3 Pro Image Preview (and the 3.1 Flash fallback) does not honor "Do not" as negation in image prompts — it treats each listed noun as a topic. The cluster `logos + watermarks` is a known soft trigger for the safety classifier under category `OTHER` (brand/IP mimicry), and we emit it twice in the same prompt, which guarantees a block on most runs.

This matches the deployed logs: all 3 slots return `SAFETY_BLOCKED:OTHER` before any image bytes are produced.

## Fix (frontend prompt assembly only)

Rewrite both occurrences to use **positive, declarative phrasing** that conveys the same intent without naming the flagged nouns.

1. **NEGATIVE section (line 283-285)** — replace with a positive constraint:
   - `"Keep the frame clean and unbranded: a single hero product, plain surfaces, no overlaid graphics or signage."`

2. **ROLE header (line 320)** — drop the `logos/watermarks/UI chrome` enumeration and end with a positive directive:
   - `"... Aspect ratio 4:5 portrait — REQUIRED. Clean, unbranded composition with a single hero product."`

3. Leave all other negative clauses (location-lock, subfamily safeguards) untouched — they don't list IP-adjacent nouns and aren't part of the trigger.

## Why this works

- Removes the `logos + watermarks` token cluster that the classifier flags.
- Replaces ineffective negation with a positive instruction the image model actually follows.
- Preserves the original intent (no text overlays, no extra products, no brand chrome).
- No backend / edge function change needed — fallback chain stays as a safety net.

## Files touched

- `src/features/brand-scenes/prompt/assembleSceneDirective.ts` (two string replacements)

## Validation

- Re-run a brand-scene generation on `/app/brand-scenes/new`; expect `finishReason: STOP` and inline image data instead of `SAFETY_BLOCKED:OTHER` in the `generate-brand-scene` edge logs.
