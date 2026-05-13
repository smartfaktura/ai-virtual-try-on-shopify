# Add "6o Apparel" showcase page

Create a new showcase page mirroring the existing `BrandSampleShowcase` layout, populated with the most recent generation from `info@tsimkus.lt` for the product **"Red Sports Bra and Skirt Set"** (39 scenes after exclusions).

## Source data

- **User:** info@tsimkus.lt (`fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc`)
- **Product:** Red Sports Bra and Skirt Set (`068311e4-8ad6-41c0-8a7f-855635b9ae9e`)
- **Batch:** 42 completed jobs from 2026-05-13 ~16:05 UTC
- **Excluded scenes:** Chair Core Editorial, Warm Café Focus, Clay Court Baseline Walk
- **Final image count:** 39 (each job's first result URL from `generation_jobs.results[0]`)

## Files

1. **Create `src/pages/showcase/SixOApparelShowcase.tsx`**
   - Clone of `BrandSampleShowcase.tsx` structure (LandingNav, hero, stats, gallery grid, mid CTA, lightbox, final CTA, LandingFooter).
   - Brand-tailored copy:
     - SEO title: `A Sample Visual Library for 6o Apparel | VOVV.AI`, `noindex`.
     - Eyebrow: `For 6o Apparel`
     - H1: `Your activewear, your full campaign`
     - Subhead: rewrite for activewear — one product photo of a sports bra and skirt set returns a complete editorial set (court, studio, lifestyle, aesthetic).
     - Stats: `39 Visuals` and a plausible `Made in` value (use the elapsed batch span ≈ `~30s` based on the `created_at` spread of the jobs; finalize from data at build time).
     - Mid CTA, final CTA strip same as current — keep dark `#0f172a` band, white CTA → `/auth`, secondary → `/discover`.
   - `IMAGES` array: 39 entries, each `{ url, scene, category }`. All categorised as `Editorial` except the three "Aesthetic …" scenes and any flatlay → `Essentials` (Aesthetic Set Flat Lay, Aesthetic UGC Mirror, Aesthetic Sport Hero stay Editorial since they read as on-model; only the flatlay = Essentials). Final assignment finalised when writing the file.
   - Image order interleaved for visual variety (alternate padel/tennis/aesthetic/clay/glass-wall scenes so adjacent cards differ — same approach as the dress showcase).

2. **Edit `src/App.tsx`**
   - Add lazy import for `SixOApparelShowcase`.
   - Add route `/showcase/6o-apparel` (kebab + numeric — matches existing brand-slug pattern).

## Out of scope

- No new DB writes, no changes to scene logic, no edits to other showcases.
- No sitemap entry (page is `noindex`, like the existing `BrandSampleShowcase`).

## Validation

- After build, navigate to `/showcase/6o-apparel`, confirm 39 cards render, lightbox works, stats and copy are 6o-Apparel-specific, and excluded scenes are not present.
