All edits in `src/components/app/DashboardFreshScenes.tsx` modal block (lines 198–238).

1. **Modal width = image width on mobile (no side bars).** On `DialogContent` add `w-fit` and replace mobile width default so it shrinks to its content (the 4:5 image column). Change `max-w-5xl` → `w-fit max-w-[92vw] md:w-auto md:max-w-5xl`. Also keep image wrapper `h-[55dvh] w-auto aspect-[4/5] mx-auto` (already done). Result: the dialog box is exactly as wide as the 4:5 image on mobile.

2. **Centered title on mobile.** On the text container (line 208) add `items-center text-center md:items-stretch md:text-left`. On `DialogTitle` keep current classes (centering inherited).

3. **Close button = same size/style as CTA.** Replace the small text `<button>Close</button>` with a `<Button variant="outline">` that mirrors the CTA's sizing: `w-full h-10 md:h-11 text-sm md:text-base`. Remove the `mx-auto` text-link styling.

No behavior changes; only layout/sizing classes and the close-button element swap.