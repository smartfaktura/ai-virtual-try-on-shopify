# Growth +25% Bonus Credits — Limited Time Offer

Add a promotional +25% bonus on Growth plan credit grants (monthly 1500 → 1875, annual 18000 → 22500) for a limited window, and surface the promo in the Upgrade modal and Settings/billing page.

## Difficulty

Small. ~3 file edits, no schema changes, no Stripe changes.

## Scope

**In:** Growth tier only (monthly + annual). Applies to new subscriptions and monthly renewals that happen while the promo window is active.
**Out:** Pro/Starter, retroactive top-ups for existing Growth subs already renewed this cycle (unless we also flag those — see "Open question" below).

## Changes

1. **Promo config (single source of truth)** — new file `src/config/growthBonusPromo.ts`:
   - `GROWTH_BONUS_PERCENT = 25`
   - `GROWTH_BONUS_END = "2026-05-31T23:59:59Z"` (end of this month)
   - `isGrowthBonusActive()` helper
   - `applyGrowthBonus(credits, plan)` helper → returns `Math.round(credits * 1.25)` when plan is `growth` and promo is active, else original.

2. **Credit grant logic** — `supabase/functions/check-subscription/index.ts`:
   - Mirror the same constants (Deno can't import from `src/`).
   - When resolving a Growth price → multiply `credits` by 1.25 if `Date.now() < GROWTH_BONUS_END`.
   - Affects both monthly (1500 → 1875) and annual (18000 → 22500) grants on renewal.

3. **Upgrade modal UI** — `src/components/app/UpgradePlanModal.tsx`:
   - On the Growth card, show a small badge "+25% bonus credits · limited time".
   - Display credits as `1,875 /mo` with `1,500` struck-through next to it.
   - Footnote: "Limited-time offer through May 31."

4. **Settings page** — wherever the current plan + monthly allowance is displayed (Plans & Credits section).
   - If user is on Growth and promo active: show same "+25% bonus" badge and the bumped allowance.
   - If user is on any other plan: small banner "Upgrade to Growth this month and get +25% bonus credits."

5. **Sidebar `CreditIndicator`** — uses `planConfig.monthlyCredits`. Update the Growth row in `src/contexts/CreditContext.tsx` `PLAN_CONFIGS` via the same helper so the `/ 1875` denominator matches reality during the promo.

## Open question

Should existing Growth subscribers who already renewed this month get the +25% topped up now (one-time backfill via an admin script), or only get it on their next renewal during the window? Backfill = ~10 extra minutes (one SQL update via the credit RPC). Default to next-renewal-only unless you say otherwise.

## Risk

- Forgetting to remove the promo after `GROWTH_BONUS_END` → mitigated by a single constant that automatically expires.
- Edge function and frontend constants must stay in sync (two places) — documented in the new config file's header comment.
