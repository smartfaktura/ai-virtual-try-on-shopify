# Lift sticky wizard footer on mobile

Two files, single tweak each — raise the sticky CTA bar on mobile so it sits clear of the browser's bottom chrome on iOS Safari.

## Changes
1. `src/features/brand-scenes/wizard/WizardLayout.tsx` (line 143)
   - `sticky bottom-2 sm:bottom-4` → `sticky bottom-5 sm:bottom-4`
2. `src/pages/BrandModels.tsx` (line 1103)
   - `sticky bottom-2 sm:bottom-4` → `sticky bottom-5 sm:bottom-4`

`pb-[env(safe-area-inset-bottom)]` stays, so devices with a home indicator still get the inset on top of the lifted offset. Desktop (`sm+`) layout unchanged.

## Verify
Reload `/app/n` and `/app/brand-scenes/new` at 390×844 — footer pill now sits ~20px above the viewport bottom, clearly visible above Safari's address bar.
