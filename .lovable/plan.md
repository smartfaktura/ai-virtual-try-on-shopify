Three improvements to `/ai-product-photography`:

## 1. Fix `PhotographyVisualSystem` aspect ratio — vertical, 3 images per card

The "One photo · Many outputs" grid currently shows ONE horizontal `aspect-[16/10]` image per card. Since the catalog is vertical editorial imagery, those images get cropped/letterboxed and feel off.

**Change:** make each card a **horizontal collage of 3 vertical thumbnails** stacked side-by-side (same pattern used by the category chooser cards), using a `aspect-[3/2]` outer container with 3 vertical tiles inside (`aspect-[3/4]` each). Pick 3 on-topic preview images per output type from the live catalog.

File: `src/components/seo/photography/PhotographyVisualSystem.tsx`
- Replace single `imageId` per item with `imageIds: string[]` (3 ids).
- Replace the single `<img>` block with a 3-column `grid grid-cols-3` of small vertical cards.
- Adjust outer aspect to `aspect-[5/3]` so the three vertical tiles sit nicely.

## 2. Add a Models section on the page

Use the existing `HomeModels` component (which renders `ModelsMarquee`) directly — same component already used on the homepage, so it stays in sync.

File: `src/pages/seo/AIProductPhotography.tsx`
- Import `HomeModels` from `@/components/home/HomeModels`.
- Place it between `PhotographyVisualSystem` and `PhotographyHowItWorks` so the flow is:
  Hero → Categories → One photo / Many outputs → Models → How it works → Scenes → Use cases → Comparison → FAQ → CTA.

## 3. Improve `PhotographySceneExamples` copy

Replace the weak heading with a category-aware, value-driven block.

File: `src/components/seo/photography/PhotographySceneExamples.tsx`

- Eyebrow: `Scene library · 1600+ ready-to-use scenes`
- H2: `Every scene your store needs — already styled.`
- Subhead: `Studio, lifestyle, editorial, streetwear, and seasonal scenes built for e-commerce. Pick one, drop in your product, generate brand-ready visuals in minutes.`

No data-model changes outside `PhotographyVisualSystem.tsx`. No routing changes.