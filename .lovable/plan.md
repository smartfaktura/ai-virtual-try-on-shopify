# Fix phone-case "overlay" feel — move reminder to top, rephrase

## Problem
The `FINAL REMINDER` line we appended at the end of phone-case prompts is making outputs look like the case artwork is *pasted/overlaid* on top of the rendered phone, instead of being the actual physical case. The word "literal visual copy" plus its position right after `AVOID:` reads to the model as a post-render compositing instruction.

## Fix

### 1. Remove the trailing FINAL REMINDER (both files)
- `supabase/functions/generate-workflow/index.ts` line 677 — drop the `${isPhoneCase ? '\n\nFINAL REMINDER: …' : ''}` suffix.
- `src/lib/productImagePromptBuilder.ts` line 1601 — drop the `\n\nFINAL REMINDER: …` suffix.

### 2. Add ONE strong opening line at the very top of the phone-case prompt
Inserted before the scene/theme block, framed as physical reality (not overlay):

> `PHONE CASE — PRIMARY SUBJECT LOCK: The phone and case visible in the final image ARE the exact physical phone+case shown in [PRODUCT IMAGE]. Render them as a real object existing in the scene — not as artwork pasted, overlaid, mocked-up, or composited onto a generic phone. The case's printed graphics, colors, stripes, edges, corner radius, and the phone's camera island shape, lens count, and lens positions must match [PRODUCT IMAGE] pixel-for-pixel because it IS the same object.`

- In `generate-workflow/index.ts`: prepend this line to `phoneCaseBlock` (around line 643) so it lands at the top of `PRODUCT DETAILS` instead of after `AVOID:`.
- In `productImagePromptBuilder.ts`: prepend the same line at the start of the phone-case fidelity append (line 1601), and keep the existing detailed HARD CONSTRAINT block right after.

### 3. Audit phone-case prompt phrasing for overlay-implying words
Sweep both phone-case blocks and remove/soften anything that could read as overlay:
- "Copy the … area" → "Match the … area" (copy implies paste).
- Leave "Preserve every printed graphic…" as-is (preserve = part of the object, fine).
- No "sticker", "apply", "place on top", "overlay" phrasing exists today — confirmed clean.

### 4. Version bump
`public/version.json` → new timestamp.

## Files
- `supabase/functions/generate-workflow/index.ts`
- `src/lib/productImagePromptBuilder.ts`
- `public/version.json`

## Not changing
- Reference image ordering (product is already first).
- Analyzer, model selection, UI, billing, other categories.
- The existing detailed `PHONE CASE FIDELITY` blocks — they stay; only repositioned and prefixed.
