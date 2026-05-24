# Brand Scenes — Hardening Plan

Six fixes ordered by impact. All scoped to the brand-scenes feature.

## 1. SSRF protection on inbound image URLs (security — high)
**File:** `supabase/functions/generate-brand-scene/index.ts`

`urlToInlineData()` currently fetches whatever URL the client sends for `referenceImageUrl`, `modelImageUrl`, and `productImageUrl`. A malicious caller could point them at `http://169.254.169.254/...` or `http://localhost:...` and exfiltrate the response into Gemini.

Add a `isAllowedImageUrl(url)` guard that requires the URL to:
- parse as `https://`
- have a host ending in `.supabase.co` OR match the project's `SUPABASE_URL` host
- contain `/storage/v1/object/public/` in the path

Reject (skip the fetch, log a warning) any URL that fails. Apply before each `urlToInlineData()` call.

## 2. Tighten anti-spoof on save (security — medium)
**File:** `supabase/functions/save-brand-scene/index.ts`

`pickedVariationUrl` is validated only by substring match on `/<user_id>/brand-scenes/`. Add the same host/prefix check as #1 so `https://attacker.com/<uid>/brand-scenes/x.png` is rejected. Must also include `/scratch-uploads/` in the path.

## 3. Scheduled orphan cleanup (data hygiene — medium)
**New edge function:** `cleanup-brand-scene-orphans`

Lists every `<user>/brand-scenes/<runId>/` folder in `scratch-uploads`, skips any file that matches a `preview_image_url` on a `product_image_scenes` row, deletes the rest if older than 24h.

Schedule with pg_cron daily at 04:00 UTC via `supabase--insert` (user-specific URL/key per the cron guidance).

## 4. Proportional refund on partial generation (billing fairness — medium)
**File:** `supabase/functions/generate-brand-scene/index.ts`

When `failed_count > 0` but `variations.length > 0`, refund `Math.floor(20 * failed_count / 3)` credits via `refund_credits`. Return the adjusted `new_balance`. Update Step6 toast copy to reflect the actual charge.

## 5. Persist variations across back navigation (UX — low)
**Files:** `src/features/brand-scenes/wizard/useWizardState.ts`, `Step6PreviewAndPick.tsx`

Move `variations` + `selectedUrl` + `runId` into wizard state so a back-and-return on step 6 doesn't discard a paid generation. Clear them only when the user edits any prior step in a way that would invalidate the prompt (use a derived prompt-hash check).

## 6. Visual disable on rapid double-click (UX — low)
**File:** `Step6PreviewAndPick.tsx`

Add `const [submitting, setSubmitting] = useState(false)` mirroring `inFlightRef`, and bind it to the Generate button's `disabled`. Closes the brief window before `phase` flips.

## Out of scope
- Refactoring the wizard step model
- Any change to `product_image_scenes` schema or RLS
- Stock product taxonomy (already correct after last round)

## Technical notes
- All edge function changes preserve `getClaims` auth pattern.
- Cron job SQL goes through `supabase--insert` (not migration) because it contains the project anon key.
- No new tables, no new RLS policies.
