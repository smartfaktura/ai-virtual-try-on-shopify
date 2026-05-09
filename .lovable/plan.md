## Update `/ai-product-photography/home-furniture`

Three focused changes to the Home & Furniture category page — all data + a small page-template insertion. No new components.

### 1. Add a 4-image hero collage (matches other hub pages)

Add a `heroCollage` array to the `home-furniture` entry in `src/data/aiProductPhotographyCategoryPages.ts`. Reuse 4 existing furniture scene images already wired into `sceneExamples` so the hero shows real, varied room types:

- Tile 1 — Living Room — `1778050204000-gl9kym`
- Tile 2 — Bedroom — `1778048568910-lx1q0n`
- Tile 3 — Dining Room — `1778071100932-306rp9`
- Tile 4 — Outdoor — `1778061177176-1ii0an`

`CategoryHero` already auto-switches to the staggered 2×2 collage layout when `heroCollage.length >= 4` — no component edits needed.

### 2. Render subcategory pills right after the hero

The component `CategorySubcategoryChips` already exists (white pill rail with mobile snap-scroll, tablet+ centered wrap) and reads `page.subcategories`. It just isn't mounted in `src/pages/seo/AIProductPhotographyCategory.tsx`.

Insert `<CategorySubcategoryChips page={page} />` between `<CategoryHero />` and `<CategoryBuiltForEveryCategory />`. This lights up the chips on every category page that already defines subcategories (furniture, beauty, fragrance, jewelry, etc.) — consistent across the hub.

### 3. Richer copy + more furniture scenes

- **Hero subheadline** — rewrite to feel more editorial and specific to furniture/decor (mention materials + room moods, keep no terminal period).
- **Meta description** — tighten and expand keyword coverage (Japandi, Mediterranean, Parisian moods).
- **`sceneExamples`** — add 4 more entries to take the on-page library from 8 → 12 (Lived-in living room, Japandi bedroom, Sofa hero, Lighting decor moment) reusing existing furniture imageIds where available.
- **`visualOutputs`** — light copy polish on 2-3 cards for sharper editorial tone.

### Out of scope

- No changes to other category pages' content.
- No new React components.
- No DB / RLS / edge function work.

### Technical notes

- File edits: `src/data/aiProductPhotographyCategoryPages.ts` (data), `src/pages/seo/AIProductPhotographyCategory.tsx` (one-line component insert).
- LCP preload in `HeroPreload` already targets `heroCollage[0]` automatically when present — no extra wiring.
- All imageIds reused are already in the `category-previews` storage bucket.
