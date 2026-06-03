
# Show savings % badge under price in upgrade modal

Add a small percentage badge directly under the `$XX /mo` price on Growth and Pro cards. Starter = baseline, no badge.

## Change

Edit only `src/components/app/UpgradePlanModal.tsx`.

- Compute baseline as the cheapest plan in `upgradePlans` by `$ per credit` (Starter in practice).
- For each non-baseline card, compute:
  ```
  perCredit = displayPrice / credits   // uses active monthly/annual price
  savings   = Math.round((1 - perCredit / baselinePerCredit) * 100)
  ```
- Render the badge in the existing right-aligned price column, on the line **right under** `$XX /mo`, replacing/co-existing with the current annual "Save $X/yr" line:
  - If monthly and `savings > 0`: small pill `−{savings}%` in `text-[10px] font-semibold` with `bg-primary/10 text-primary px-1.5 py-0.5 rounded-full mt-0.5 whitespace-nowrap`.
  - If annual: keep the existing `Save $X/yr` line and append the same `−{savings}%` pill next to it (or stack — pill below).
- Baseline card renders nothing extra.
- Updates live when toggling Monthly ↔ Annual.

## Notes

- Pure frontend, no schema, no copy file, no Stripe changes.
- Uses existing design tokens (`primary`, `primary/10`) — no new colors.
- No terminal period; concise label per memory rules.
