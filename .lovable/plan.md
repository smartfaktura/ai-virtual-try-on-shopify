## Diagnosis

Three issues across the 10 `/ai-product-photography/{slug}` hub pages:

### 1. Missing / incorrect images
- **`supplements-wellness`** and **`electronics-gadgets`** only have **1 chip group / 8 images** in the "Built for every category" grid (the build script under-collected). The DB has 5–6 sub-categories with 30+ scenes each, all unused.
- A few hub pages reference `imageId`s that resolve but show off-topic shots (e.g. duplicate IDs in the supplements `sceneExamples` list — same image used twice — and food-beverage doesn't reuse beverage editorial IDs in its scene examples).
- React warning logged on every page: `Function components cannot be given refs` originating from `JsonLd`, `PhotographyFinalCTA`, and `LandingFooter`. Harmless but spammy and indicates these are wrapped without `forwardRef`.

### 2. Slow loading
- Every BUILT_FOR group ships **8 full-quality scene previews** even though only one chip's grid is visible at a time. With 6 chips that's **48 images requested up-front per hub page** (multi-category pages reach **~390 image rows in the imported data file** because the whole `BUILT_FOR_GRIDS` constant is bundled).
- Hero image and collage images request `quality=70` Supabase render but no `width=`, so the CDN serves the full source file — slow LCP.
- `loading="lazy"` is on grid tiles, but inactive chips are still in the DOM (just rendered when picked) — actually fine. The real waste is the JSON payload size + non-sized image fetches.

### 3. Visual polish vs `/home`
- `/home` uses a marquee hero, premium chip rail with snappy transitions, cards with rich shadows/transitions, and a video card. Hub pages today look "templated" — all sections share the same `bg-[#f5f5f3]` and rounded white cards. No rhythm.
- "Related product photography categories" tiles use a single hero image (16:10) per related category. User wants a **3-image horizontal collage** per related card so each tile teases the variety inside.

## Fix

### A. Data — re-collect missing scene groups (all hub pages)

Update `src/data/aiProductPhotographyBuiltForGrids.ts` (regenerate the affected slugs by querying the live `product_image_scenes` table, grouped by `sub_category`):

- `supplements-wellness` → 6 chip groups: Essential Shots, Editorial Wellness Routine, Aesthetic Color Wellness Stories, Ingredient / Capsule Still Life, Kitchen / Gym / Daily UGC, Creative Shots (8 cards each, capped).
- `electronics-gadgets` → 5 chip groups: Essential Shots, Editorial Tech Studio, Aesthetic Color Tech Stories, Desk / Hand / Daily Use UGC, Surface / Setup / Product Still Life.
- Spot-fix duplicate IDs in `sceneExamples` for `supplements-wellness` (`1776247491181-ox42m3` and `1776247494837-xnpgly` appear twice) and `electronics-gadgets` (`1776250225810-gdcnka`, `1776590053673-96gw3b`, `1776590052780-j2ahu2` appear twice). Replace with fresh DB picks so the 8-tile examples grid is unique.
- Audit the `heroCollage` IDs of multi-category pages once more to confirm each tile actually depicts its subcategory (already done for fashion + bags-accessories last round; verify food-beverage, home-furniture).

### B. Performance — three compounding wins

1. **Size every grid/related/scene image** by passing `width` to `getOptimizedUrl` (e.g. `width=480` for grid tiles, `width=720` for collage tiles, `width=900` for hero, `width=560` for related-card collage thumbs). Supabase's render endpoint will serve resized JPEGs that are ~5–10× smaller.
2. **Defer non-active chip groups**: only mount the grid tiles for the active chip; preload the next chip on hover. Cuts initial image requests on multi-chip pages from 48 → 8.
3. **Add `fetchpriority="high"` to the hero image** and keep `loading="eager"` so LCP fires fast. Everything else stays `loading="lazy" decoding="async"`.
4. (Optional cleanup) Add `forwardRef` shims to `JsonLd`, `PhotographyFinalCTA`, `LandingFooter` to silence the React ref warning. Pure noise removal — no behavior change.

### C. "Related product photography categories" — 3-image horizontal collage per card

Rebuild the related-card visual (`CategoryRelatedCategories.tsx`):

- Each card's image area becomes a **3-column horizontal collage** (`grid grid-cols-3 gap-1`) at `aspect-[16/9]`. The three images come from that related category's first 3 scene examples (or its hero collage if present, or first 3 BUILT_FOR cards as fallback) — picked via a small helper `getRelatedThumbs(slug)`.
- Each thumb is `object-cover`, sized via `getOptimizedUrl(..., { width: 320, quality: 60 })`, lazy.
- Soft inner padding (`p-1`), rounded subtiles, subtle hover scale on whole card. Keeps the card feeling like one unit, not three loose images.

### D. Visual polish — make hub pages feel like `/home`

Tighten the template without changing structure:

1. **Hero**: tighten the gap, lift the H1 with `tracking-[-0.035em]`, add a tiny "trust" bar under the buttons (`No photoshoot · 2K resolution · Built for {groupName} brands`) styled like /home's pill row.
2. **Built-for section**: chip rail gets `/home`-style segmented look — pill row inside a thin border container with active chip in solid foreground; tiles get `aspect-[3/4]` (already done) and a soft hover label fade-up like /home.
3. **Section rhythm**: alternate `bg-background` ↔ `bg-[#FAFAF8]` ↔ `bg-[#f5f5f3]` deliberately — currently three sections in a row use `#f5f5f3`. Pattern: Hero (#FAFAF8) → BuiltFor (bg) → Subcategory chips (#FAFAF8) → VisualOutputs (bg) → PainPoints (#FAFAF8) → SceneExamples (bg) → HowItWorks (existing) → UseCases (#FAFAF8) → Related (bg) → FAQ (#FAFAF8) → FinalCTA.
4. **Cards** (visual outputs, pain points, use cases): swap the heavy white card on light grey with a softer treatment — `bg-white/70 backdrop-blur-sm` with hairline border, `rounded-3xl`, longer hover lift (`translate-y-[-2px] shadow-lg`). Mirrors /home's premium feel.
5. **Section titles**: bump font weight/tracking and use the `/home` two-tone heading pattern (`text-foreground` + a muted accent span on the highlight word) where natural.

### E. Smoke test
After edits, navigate to `/ai-product-photography/supplements-wellness` and `/electronics-gadgets` to confirm chip rails now show 5–6 groups; spot-check a few other hub pages for image fidelity.

## Files

- `src/data/aiProductPhotographyBuiltForGrids.ts` — regenerate the two thin slugs (rebuild via `psql` query → emit JSON groups). 
- `src/data/aiProductPhotographyCategoryPages.ts` — replace duplicate-ID scene examples; add `heroNoun` to supplements/electronics if missing; verify collages.
- `src/components/seo/photography/category/CategoryHero.tsx` — width-sized hero, `fetchpriority`, optional pill-row trust bar.
- `src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx` — render only active group's tiles, width-sized URLs, segmented chip styling, hover-preload next chip.
- `src/components/seo/photography/category/CategoryRelatedCategories.tsx` — replace single image with 3-image collage helper.
- `src/components/seo/photography/category/CategorySceneExamples.tsx` — width-sized URLs, softer card treatment.
- `src/components/seo/photography/category/CategoryVisualOutputs.tsx`, `CategoryPainPoints.tsx`, `CategoryUseCases.tsx` — softer card treatment, alternating section backgrounds aligned with the rhythm above.
- `src/pages/seo/AIProductPhotographyCategory.tsx` — apply the new alternating-bg rhythm by passing `tone` props or wrapping sections (small reorder + className tweaks; no structural change).
- (Optional) `src/components/JsonLd.tsx`, `src/components/seo/photography/PhotographyFinalCTA.tsx`, `src/components/landing/LandingFooter.tsx` — wrap with `React.forwardRef` to silence ref warning.

No DB migrations, no new dependencies.