## Problem

When a user uploads a phone case, `analyze-product-category` asks the AI for a category. The AI often returns `"tech-devices"` (a valid category), so the function early-exits at the "valid category" check and never reaches the title-based phone-case detection. Result: phone case → Tech & Devices instead of Phone Cases.

The existing `SPECIFICITY_OVERRIDES` table has no `tech-devices → phone-cases` entry, so an AI label of `tech-devices` is never corrected even when the title clearly says "phone case".

## Fix

Single file: `supabase/functions/analyze-product-category/index.ts`

1. **Add two specificity overrides** so AI-returned parents get remapped when the title matches a phone-case pattern:
   ```ts
   ["tech-devices",     /phone case|iphone case|airpods case|samsung case|magsafe|silicone case|clear case|leather case/i, "phone-cases"],
   ["bags-accessories", /phone case|iphone case|airpods case|samsung case|magsafe|silicone case|clear case/i, "phone-cases"],
   ```

2. **Strengthen the system prompt** with a sharper rule: any product that *is* a case for a phone/AirPods/MagSafe must be `phone-cases`, never `tech-devices` or `bags-accessories`.

No DB changes, no schema changes, no client code changes. Patterns are tight ("phone case", "iphone case", "magsafe", etc.) so false-positive risk is negligible, and the override only fires when the AI already picked one of the two parent buckets.

## Verification

- Re-run product analysis on the uploaded phone case → category resolves to `phone-cases`.
- Check edge function logs for `Category specificity override: "tech-devices" -> "phone-cases"`.
- Confirm Step 2 Scenes loads the Phone Cases bucket under Bags & Accessories.
