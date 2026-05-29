Update `src/components/library/SceneDetailModal.tsx` (the popup on `/product-visual-library`):

**1. Make the modal larger**
- Bump `DialogContent` max-width: `sm:max-w-3xl md:max-w-5xl lg:max-w-6xl` (was `sm:max-w-2xl md:max-w-3xl`)
- Raise height cap to `max-h-[92vh]` (was `88vh`) and round to `sm:rounded-[2rem]`
- Rebalance the split so the hero gets more room: `md:grid-cols-[7fr_5fr]` (was `5fr_6fr`)
- Let the hero fill the modal height on desktop: add `md:aspect-auto` so it stops being locked to 4:5 and matches the panel height

**2. Refine the white text panel with VOVV spacing standards**
- Padding: `p-6 sm:p-10 md:p-12` (was `p-4 sm:p-8`)
- Switch from a single `gap-*` stack to explicit vertical rhythm using `mt-*`:
  - Badges row at top
  - Title: `mt-6 sm:mt-8`, `text-2xl sm:text-3xl md:text-[2.125rem]`, `leading-[1.15]`
  - Description: `mt-5 sm:mt-6`, `text-[0.95rem] sm:text-base`, `text-foreground/60`, `max-w-prose`, remove `line-clamp` so the copy breathes
- CTA block pinned to bottom on desktop: `md:mt-auto md:pt-12`, button height `h-[3.5rem]`
- Badges: add `px-3 py-1` for more presence
- Close button: `h-10 w-10`, `top-4 right-4`
- Drop the trailing period on the helper line ("…adapt this look") to match the no-terminal-periods rule for single-sentence subtitles

No logic, props, data, or routing changes. Pure presentation update.
