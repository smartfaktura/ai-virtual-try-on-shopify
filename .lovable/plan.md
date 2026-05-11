## Tighten the showcase stats strip

On `/showcase/brandname` the stats row currently shows three cards: **30 Visuals · ~60s Made in · 2 Scene Sets**. Update it as follows.

### Changes (in `src/pages/showcase/BrandSampleShowcase.tsx`)

1. **Remove the "Scene Sets" card** entirely. The grid drops from 3 columns to 2 columns and stays centered with a tighter `max-w-xl` so two cards don't look stranded.
2. **Fix the time value** from `~60s` to `73s` (real generation time, no tilde).
3. **Upgrade the icons** for a more refined, editorial feel:
   - Visuals: swap `Images` → `LayoutGrid` (cleaner geometric mark that reads as "a library of shots")
   - Made in: swap `Clock` → `Timer` (more dynamic, suggests speed rather than a wall clock)
   - Bump icon size from `18` → `20` and color from muted slate `#94a3b8` to brand ink `#0f172a` at 70% opacity, so they feel intentional instead of decorative.

### Out of scope

- No layout, hero, gallery, lightbox, or CTA changes
- No copy changes outside the two stat cards
