

## Polish Wordmark sweep + DotPulse (Loading Lab only)

### Scope check (safety)
- `BrandLoaderProgressGlyph` (Wordmark sweep) — imported **only** in `src/pages/admin/LoadingLab.tsx`. Zero production usage.
- `DotPulse` — imported **only** in `LoadingLab.tsx`. Zero production usage.
- `Loader2` (used everywhere else) is **not** touched.
- All keyframes already exist in `src/index.css` and have `prefers-reduced-motion` fallbacks. We will only tweak Tailwind classes inside the two components — no CSS, no API, no Loading Lab page changes, no other consumers.

**Risk: effectively zero.** Worst case, the Loading Lab previews look slightly different.

### Changes

**1. `src/components/ui/brand-loader-progress-glyph.tsx` — Linear-style refinement**

Current loader is fine but feels a bit thin. Refinements:
- Use `VOVV.AI` (matches brand mark rule from memory) instead of `VOVV`.
- Slightly larger, tighter wordmark (`text-[15px]`, `tracking-[0.18em]`, `font-medium`) so it reads as a logo, not body text.
- Replace the static `bg-border/60` track with a softer gradient track (`bg-gradient-to-r from-transparent via-border to-transparent`) so the sweep feels seated.
- Sweep bar gets a soft gradient head (`bg-gradient-to-r from-transparent via-primary to-transparent`) and slightly wider (`w-[40%]`) for a more Linear-like feel.
- Track widens to `w-20` and centers under the wordmark.
- Hint text: bump to `text-[11px]`, `tracking-[0.14em]`, `uppercase`, `text-muted-foreground/80` — matches Linear's micro-label tone.
- Keep all existing animation classes (`animate-glyph-sweep`, `animate-glyph-breathe`) — reduced-motion path stays intact.
- Props/exports unchanged.

**2. `src/components/ui/dot-pulse.tsx` — tighter, more premium dots**

- Add a third size `'lg'` (kept backward compatible, default still `'sm'`).
- Increase visual contrast on `md`: `w-[5px] h-[5px]` instead of `w-1.5 h-1.5` (slightly less chunky, more refined).
- Tighten gaps: `sm` → `gap-[3px]`, `md` → `gap-[5px]`, `lg` → `gap-1.5`.
- Base opacity drops from `0.7` → `0.55` so the wave amplitude reads stronger.
- Keep `currentColor`, `role="status"`, ARIA label, animation class — purely visual tweaks.

### Out of scope
- No changes to `BrandLoader` (orbit), `BrandLoaderAperture`, `BrandLoaderFrames`, `ShimmerBar`, `LoadingLab.tsx`, `src/index.css`, or any consumer.
- No new keyframes, no Tailwind config edits.
- No rollout to production loaders — that's a separate decision once a winner is picked.

### Verification
1. Open `/app/admin/loading-lab` → "Wordmark sweep — Linear-style" card now shows polished `VOVV.AI` mark with softer sweep.
2. DotPulse cards (sm, md, button, chip, sidebar) all render with tighter spacing and stronger pulse.
3. Toggle OS "Reduce motion" → both fall back to soft opacity pulse (existing reduced-motion CSS still applies).
4. No other page in the app changes.

