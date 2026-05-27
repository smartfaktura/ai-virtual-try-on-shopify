## BIOMA Showcase Page at `/showcase/bioma`

Mirror the existing `MakaraWearShowcase` layout exactly (hero, stats, 4-col masonry, lightbox, dark CTA, footer) for the BIOMA Anti-Stress Probiotic Supplement generation by user `fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc` at 2026-05-27 19:53 UTC.

**Source data:** 59 completed jobs in `generation_jobs`, minus 6 jobs across the 4 excluded scenes (Vanity Nook, Cozy Bedroom, Coastal Wellness Ritual, Beachside Supplement Ritual) = **53 visuals**.

**Page already drafted** at `src/pages/showcase/BiomaShowcase.tsx` (53 image URLs hardcoded with scene + model labels). Stats card and hero subtitle still read "59" — needs to be corrected to "53" since the excluded ones are not in the gallery.

## Steps

1. **Fix copy** in `src/pages/showcase/BiomaShowcase.tsx`:
   - Stats: `59` → `53`
   - Subtitle: "59 visuals, ready for web, social, and retail" → "53 visuals, ready for web, social, and retail"
2. **Add route** in `src/App.tsx`:
   - `const BiomaShowcase = lazy(() => import('@/pages/showcase/BiomaShowcase'));`
   - `<Route path="/showcase/bioma" element={<BiomaShowcase />} />`

## Out of scope
- No DB changes, no other showcase pages touched, no shared component extracted.
