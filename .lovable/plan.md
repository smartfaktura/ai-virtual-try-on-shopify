Fix overflow on the Settings → Choose Your Plan cards (`/app/settings`) so CTA buttons and the "Most Popular" / "Current" / "Monthly" pills fit cleanly at every breakpoint.

## Problems observed
1. CTA buttons (`Downgrade to Starter`, `Upgrade to Growth`, etc.) get clipped because the shared `Button` component sets `whitespace-nowrap` and a fixed height.
2. The "Most Popular" badge above the Growth card wraps onto two lines and breaks out of the pill.
3. On the current plan card, "Pro", "Current", and "Monthly" badges crowd each other on narrow widths.

## Changes (single file: `src/components/app/PlanCard.tsx`)

1. CTA button — allow two-line labels
   - Remove the nowrap constraint and let the label wrap to two lines when needed.
   - Replace fixed `min-h-[44px]` with auto height + comfortable vertical padding so a 2-line label still looks balanced.
   - Tighten the line-height and slightly reduce the font size at narrow widths so labels like "Downgrade to Starter" fit on one line at md+ but wrap gracefully on small cards.

2. "Most Popular" badge — keep on one line
   - Add `whitespace-nowrap` to the badge so it never breaks across lines.
   - Slightly reduce the horizontal padding so it fits comfortably above narrower cards.

3. Header row badges (Plan name + "Current" + "Monthly")
   - Allow the row to wrap (`flex-wrap`) so badges drop under the plan name on narrow widths instead of overflowing.
   - Make badges shrink-resistant with `whitespace-nowrap` so each pill stays intact.
   - Reduce gap/padding slightly on small screens.

## Out of scope
- No copy changes, no pricing changes, no layout changes to the surrounding Settings page.
- No changes to the shared `Button` component (other cards rely on `whitespace-nowrap`).