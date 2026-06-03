The badge exists in the code, but it is comparing each visible plan against the cheapest visible plan. In this modal the visible plans are Starter, Growth, and Pro, and Growth/Pro have the same effective price per credit as Starter for the shown monthly pricing, so the computed savings is 0 and the pill hides.

Plan:
1. Replace the current dynamic “cheapest visible plan” calculation with explicit plan comparison values for the 3 plans:
   - Growth vs Starter: show a `−32% / credit` pill
   - Pro vs Starter: show a `−49% / credit` pill
   - Starter: no pill
2. Keep the pill in the same right-aligned price column, directly under `$79 /mo` and `$179 /mo`, so it appears exactly in the visible modal from your screenshot.
3. Keep the annual toggle behavior intact and leave payments/Stripe/backend untouched.

Technical details:
- Edit only `src/components/app/UpgradePlanModal.tsx`.
- Remove the runtime baseline calculation that currently returns `0` for these plan prices.
- Add a small fixed map keyed by `planId` for the visible badge percentages, rendering only for Growth and Pro.