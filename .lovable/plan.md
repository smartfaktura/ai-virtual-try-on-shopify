

## Remove the "V" Icon from Navigation

The square "V" icon next to the wordmark is redundant — "VOVV.AI" is already distinctive enough as a text logo. Removing it will clean up the nav and give the brand a more modern, minimal look.

### Change

In `src/components/landing/LandingNav.tsx`, remove the `div` containing the "V" icon from the logo button (lines ~56-58), keeping only the `VOVV.AI` text span.

The same logo pattern may also exist in `src/components/app/AppShell.tsx` (the internal dashboard sidebar logo). I'll check and apply the same removal there for consistency.

### Files to modify

| File | Change |
|---|---|
| `src/components/landing/LandingNav.tsx` | Remove the `div.w-8.h-8.rounded-xl` "V" icon element from the logo button |
| `src/components/app/AppShell.tsx` | Remove matching "V" icon if present (for consistency) |

