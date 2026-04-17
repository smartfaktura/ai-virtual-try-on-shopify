

Remove the Freestyle wizard guide tutorial overlay.

## What to remove
- `src/components/app/freestyle/FreestyleGuide.tsx` — delete the file
- In the Freestyle page (likely `src/pages/Freestyle.tsx` or `src/pages/app/Freestyle.tsx`): remove the `<FreestyleGuide>` render, its import, related state (`currentStep`, `dismissed`), handlers (`onNext`, `onDismiss`), and any `localStorage`/`sessionStorage` keys it used.

## Verification
I'll grep for `FreestyleGuide` and `GUIDE_STEPS` to catch every reference before deleting, so no dead imports remain.

No backend changes. No other UI affected.

