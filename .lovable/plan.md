

## Improve Credit Progress Bar Visibility

The current progress bar is nearly invisible — it uses `bg-white/[0.08]` track with `bg-primary/70` fill on a dark sidebar, making it extremely hard to see (as shown in the screenshot).

### Changes

**`src/components/app/CreditIndicator.tsx`** (desktop expanded sidebar)
- Increase progress bar height from `h-1.5` to `h-2`
- Brighten the track background from `bg-white/[0.08]` to `bg-white/[0.15]`
- Use full `bg-primary` for the fill instead of `bg-primary/70`
- Add a subtle glow/shadow on the fill bar for better contrast: `shadow-[0_0_6px_rgba(var(--primary-rgb),0.4)]`
- Add color coding: green-ish primary when healthy, amber when low, red when critical/empty

**`src/components/app/AppShell.tsx`** — collapsed sidebar credit section (lines 182-211)
- Add a mini progress bar beneath the balance number in collapsed state, using the same improved styling

**`src/components/app/AppShell.tsx`** — mobile header credit pill (lines 317-331)
- Add a tiny progress bar (h-1) inside the pill below the text, giving mobile users a quick visual of remaining credits

### Files changed
- `src/components/app/CreditIndicator.tsx` — brighter, taller progress bar with status colors
- `src/components/app/AppShell.tsx` — add mini progress bars to collapsed sidebar and mobile header pill

