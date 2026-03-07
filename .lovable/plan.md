

## Fix Email Notification System — Respect User Preferences + Default Off for Generation Complete

### Problems Found

1. **Generation complete emails fire unconditionally** — the 3 edge functions (`generate-freestyle`, `generate-tryon`, `generate-workflow`) never check the user's `settings.emailOnComplete` preference before sending. Every single generation triggers an email, which will spam users heavily.

2. **Default should be OFF for generation complete** — as you noted, generation emails should be opt-in, not opt-out. Currently `emailOnComplete: true` by default.

3. **"Generation failed" email exists in settings UI but is never sent** — there's no `generation_failed` template in `send-email` and no failure hook in the generation functions.

4. **Low credits / weekly digest preferences are not checked** — the `deduct_credits()` DB function sends low-credits emails without checking `settings.emailLowCredits`.

### Plan

**1. Change defaults in Settings.tsx**
- Set `emailOnComplete: false` (opt-in only)
- Keep `emailLowCredits: true`, `emailOnFailed: true` as defaults

**2. Update all 3 generation edge functions to check user preferences**
In `generate-freestyle`, `generate-tryon`, `generate-workflow`:
- Change the profile query to also select `settings`
- Only send the email if `settings.emailOnComplete === true`
- Same pattern: ~3 lines changed per file

**3. Add `generation_failed` email template to `send-email/index.ts`**
- New template with branded VOVV.AI design: "Something went wrong" heading, job type info, navy CTA "Try Again"
- Add the `generation_failed` case to the switch statement

**4. Add failure email hooks to generation functions**
- In each generation function's error/failure path, check `settings.emailOnFailed` and send `generation_failed` email if enabled

**5. Update `deduct_credits()` DB function to respect `emailLowCredits` setting**
- Migration: modify `deduct_credits()` to read `settings->>'emailLowCredits'` from profiles before firing the low-credits email via `pg_net`

### Files Changed
| File | Change |
|------|--------|
| `src/pages/Settings.tsx` | `emailOnComplete` default → `false` |
| `supabase/functions/send-email/index.ts` | Add `generation_failed` template |
| `supabase/functions/generate-freestyle/index.ts` | Check `settings.emailOnComplete` before sending; add failure email |
| `supabase/functions/generate-tryon/index.ts` | Same |
| `supabase/functions/generate-workflow/index.ts` | Same |
| DB migration | Update `deduct_credits()` to check `emailLowCredits` setting |

