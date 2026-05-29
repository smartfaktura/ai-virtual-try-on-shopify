# Mobile polish for CategoryPickerModal

Tighten the mobile experience on `CategoryPickerModal.tsx`:

- **Edge-to-edge content**: drop horizontal padding on mobile. Header: `px-4 sm:px-8`. Body: `px-3 sm:px-8`. Category pills become near full-width with minimal side gutters.
- **Sticky header**: header gets `sticky top-0 bg-background z-10` so title + search stay visible while scrolling.
- **Compact title row**: on mobile, smaller title (`text-base sm:text-xl`), tighter top padding (`pt-4 sm:pt-8`), description hidden on mobile (`hidden sm:block`) to free vertical space.
- **Search**: full width inside the reduced padding, slightly smaller height on mobile (`h-10 sm:h-11`).
- **Close button**: ensure visible — shadcn Dialog already provides one top-right; verify it sits inside the new sticky header on mobile (no overlap with title).
- **Suggested + group pills**: on mobile, `rounded-xl` instead of `rounded-2xl` for tighter look at narrow width, `px-4 py-3.5` for tap target ≥48px. Section labels get `px-1` so they don't sit flush against the screen edge.
- **Safe area**: bottom padding `pb-[max(2rem,env(safe-area-inset-bottom))]` so the last pill clears the iOS home indicator.
- **Group spacing**: reduce `space-y-6` to `space-y-5` on mobile to fit more above the fold.

Desktop layout (sm and up) stays exactly as it is now — all changes are mobile-only via responsive prefixes.

## File touched
- `src/components/app/product-images/CategoryPickerModal.tsx`
