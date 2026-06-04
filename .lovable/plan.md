## Goal
On mobile, the Fresh Scenes preview modal should be compact and image-led — preserve the natural 4:5 scene aspect, show only the title and the action buttons, with proper sizing and spacing. Desktop layout stays unchanged.

## File
`src/components/app/DashboardFreshScenes.tsx` (Dialog block, ~lines 197–267)

## Changes (mobile only, `md:` keeps current desktop)

1. **Image — restore 4:5 ratio**
   - Image container: `aspect-[4/5] md:aspect-[4/5] md:h-[80vh]` (drop the `max-h-[42dvh]` cap).
   - `<img>`: `w-full h-full object-cover` (drop `max-h-[42dvh] md:max-h-none`).

2. **Strip body copy on mobile**
   - Remove the eyebrow category label on mobile (`hidden md:block`).
   - Remove the `DialogDescription` paragraph on mobile (`hidden md:block`). Kept in DOM for a11y via `sr-only` wrapper, or replace with `<DialogDescription className="sr-only md:not-sr-only md:text-[15px] md:leading-relaxed md:text-muted-foreground">`.
   - Keep `DialogTitle` visible on mobile: `text-base md:text-3xl font-semibold md:font-bold leading-tight line-clamp-2`.

3. **Tighten container spacing**
   - Right panel padding: `p-4 md:p-10` → `px-4 py-3 md:p-10`.
   - Inner gap: `gap-3 md:gap-6` → `gap-2 md:gap-6`.
   - Title block: collapse `space-y-2 md:space-y-3` → `space-y-0 md:space-y-3` on mobile.

4. **CTA buttons — correct size + spacing**
   - Primary `Use this scene`: explicit mobile height `h-11 text-sm md:h-11 md:text-base`, full width retained.
   - Secondary `Close`: convert to a real button under primary with `h-10 text-sm text-muted-foreground hover:text-foreground` and small top spacing (`mt-1`).
   - Wrapper: `flex flex-col gap-2 md:gap-3 pt-2 md:mt-auto md:pt-2`.

5. **Modal height cap**
   - `DialogContent` and inner scroll wrapper: keep `max-h-[85dvh] sm:max-h-[90vh]` — with the smaller text block, the 4:5 image now fits comfortably above the CTA.

## Out of scope
No data, query, navigation, or desktop changes. Pure mobile presentational pass.
