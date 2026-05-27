## Fix Settings → Choose Your Plan mobile layout

Scope: `src/pages/Settings.tsx` header + `src/components/app/PlanCard.tsx` compact mode on mobile.

### Changes

1. **Header row (Settings.tsx ~L527-546)** — stack on mobile, inline on desktop:
   - Wrap container: `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`
   - Billing toggle moves to its own row on mobile; shorten label to `Annual · Save 20%` (single line) so the pill doesn't wrap.
   - Make toggle `self-start` on mobile.

2. **PlanCard compact on mobile** — pass `compact` prop on mobile to shrink cards:
   - In Settings, set `compact={true}` for the grid (already works fine on desktop too, but to keep desktop unchanged we can keep compact off ≥sm). Simplest: always `compact` — reduces vertical bulk uniformly.
   - Reduce credits box padding on mobile inside PlanCard (`py-2` mobile / `py-3` sm+).
   - Tighten feature spacing on mobile (`space-y-1.5`).
   - Smaller price on mobile when compact (`text-2xl` → already compact handles).

3. **Card sizing** — current grid is `grid-cols-1` on mobile (full width, very tall). Cards look "too long" because of generous paddings + spacing. Tighten:
   - Card content padding mobile: `p-4` instead of `p-5 sm:p-6`.
   - Feature list: use `text-xs` on mobile.
   - Reduce `space-y-5` → `space-y-3` on mobile.

No behavior/business-logic changes — pure layout/presentation.
