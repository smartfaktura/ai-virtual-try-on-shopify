## Problem

When moving between Step 4 sub-steps (People → Interaction → Styling), the page stays scrolled down where the previous Next button was — so the new section loads mid-page instead of at the top.

The existing scroll-reset effect in `BrandSceneWizard.tsx` only triggers on `step` change, not on `step4SubStep` change.

## Change

In `src/features/brand-scenes/wizard/BrandSceneWizard.tsx`, extend the scroll-reset `useEffect` dependency list to also include `step4SubStep`, so advancing within Step 4 also snaps both `#app-main-scroll` and the window back to the top.

No other behavior, validation, or styling changes.