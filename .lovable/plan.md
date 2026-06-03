## Fix mobile clipping in Upgrade modal

The "1,500 credits · ~300 images/mo" line wraps awkwardly on mobile because the right column (price + `−32% / credit` pill + "Recommended for You" badge below the title) eats horizontal space.

### Changes (only `src/components/app/UpgradePlanModal.tsx`)

1. **Prevent the credits line from wrapping**: add `whitespace-nowrap` to the `<p>` at line 353 so "1,500 credits · ~300 images/mo" stays on one line.
2. **Free up width on mobile**:
   - Move the `Recommended for You` badge out of the title row and render it as a small chip on top of the card (or inline with the price column only on ≥sm). On mobile, drop the "for You" → show just `RECOMMENDED` to shorten.
   - Reduce the right column footprint on mobile: pill text shortened to `−32%/cr` on `<sm`, full `−32% / credit` on `sm+`.
3. **Tighter gaps on mobile**: change outer row `gap-3` → `gap-2 sm:gap-3`, inner `gap-3` → `gap-2.5 sm:gap-3`, card padding `p-4` → `p-3.5 sm:p-4`.
4. Keep desktop layout visually identical.

No business logic, no Stripe, no plan data changes.