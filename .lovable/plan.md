## Clean up the "Explore" bridge band

The light band between the dark CTA and the footer currently shows the eyebrow "EXPLORE" left-aligned with three links bunched next to it — visually busy and asymmetric.

### Fix

Edit `src/components/home/HomeFinalCTA.tsx` (lines 48-68 only):

- **Drop the "EXPLORE" eyebrow** — it adds noise without value, and the destination labels are self-descriptive.
- **Remove the top border** — softer transition from the dark CTA into the off-white band.
- **Center the links** — single centered row, generous `gap-x-8` for breathing room.
- **Migrate hex literals to tokens** (`#9ca3af`/`#6b7280`/`#1a1a2e` → `text-muted-foreground` / `text-foreground`).
- **Slightly more vertical padding** (`py-8` → `py-10`) so the row feels intentional, not crammed.

Result: a quiet, centered, single-line interlink that reads as a graceful pause before the footer rather than a label + list.

### Out of scope

- No copy changes to the link labels.
- No changes to the dark CTA above or the footer below.
