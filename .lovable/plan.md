## Why it's missing

`src/pages/BrandModels.tsx` line 1311 wraps the `PageHeader` in `{isPaid && ...}`, so free/gated users see only the `UpgradeHero` panel — no H1, no subtitle. `BrandScenes.tsx` always renders its title block above the upgrade panel, which is why it looks more complete.

## Fix

In `src/pages/BrandModels.tsx` around lines 1309–1331, render the page title block for everyone, matching the Brand Scenes pattern:

- Remove the `isPaid &&` gate on the header.
- Keep the "New brand model" action button gated: only show when `isPaid && models.length > 0` (free users shouldn't see a CTA that they can't use).
- Subtitle stays "Custom AI models that match your brand" (no trailing period, single sentence — matches our copy rule).

Result for the gated view: H1 "Brand Models" + subtitle on top, then the restyled upgrade panel below — visually matching `/app/brand-scenes`.

## Out of scope
- The `UpgradeHero` panel itself (already restyled in the previous turn).
- Paid state, generator, and locked-models list.

## Verification
- Reload `/app/models` on Starter plan: H1 + subtitle visible, upgrade panel underneath, no "New brand model" button.
- Switch to Growth: header unchanged, "New brand model" button reappears when models exist.