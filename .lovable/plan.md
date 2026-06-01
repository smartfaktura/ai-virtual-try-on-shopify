## Goal
Add a new SEO category hub at **`/ai-product-photography/wedding-dresses`** for Wedding Dress brands, mirroring the structure of `/activewear` and `/hoodies`. The page is rendered by the existing dynamic template (`AIProductPhotographyCategory.tsx`) and driven entirely by a new entry in the data file plus a few small wiring updates.

## What gets added

### 1. New media assets (from your uploads)
Save under `src/assets/seo/`:
- `wedding-dresses-feed.jpg` ← `vovvaiweddingfeed-1.jpg`
- `wedding-dresses-motion-1.mp4` … `wedding-dresses-motion-6.mp4` ← uploaded `1.mp4`–`6.mp4`
- One matching poster `wedding-dresses-motion-3.jpg` (extracted first-frame) for the hero video tile

### 2. New page entry in `src/data/aiProductPhotographyCategoryPages.ts`
A full `CategoryPage` object with:
- `slug: 'wedding-dresses'`, `groupName: 'Wedding Dresses'`
- SEO title: *"AI Wedding Dress Photography for Bridal Brands | VOVV.AI"*
- Meta description, H1 (`AI wedding dress photography, / from a single upload`), hero eyebrow (`Bridal · Editorial · Atelier`), subheadline
- Primary keyword `AI wedding dress photography` + secondary/long-tail keywords (bridal photography, AI bridal editorials, wedding gown product photography, atelier photoshoot, etc.)
- `subcategories`: A-Line, Mermaid, Ball Gown, Sheath, Slip, Mini
- 4 pain points (atelier shoots cost €5k+, every gown needs editorial + PDP + lookbook + ads, seasonal launches, location/model logistics)
- 8 `visualOutputs` (editorial bridal portraits, atelier studio, garden/villa scenes, vintage car & getaway, veil & train details, on-model PDP angles, campaign heroes, social ads)
- 8 `sceneExamples` drawn from the live `wedding-dress` collection (Grand Staircase Veil, Garden Dip Kiss, Vintage Car Bridal Muse, Cliffside Goddess Gown, Atelier Mirror, Tuscan Bridal Gown, White Quarry Siren, Veil & Bouquet Pause) — all with real `imageId`s from `product_image_scenes` so previews render
- `useCases`, `faqs` (5 bridal-specific Q&As), `relatedCategories: ['fashion', 'swimwear', 'lingerie', 'jewelry']`
- `heroImageId` = `1780307460213-9gm38b` (Grand Staircase Veil)
- `heroCollage` of 4 tiles (Bridal Editorial / Video / Atelier / Garden) with one tile using `videoSrc: 'wedding-dresses-motion-3'`
- `heroNoun: 'gown'`

### 3. Wiring updates
- **`src/components/seo/photography/category/CategoryHero.tsx`** — import `weddingDressesMotion3` and add to `HERO_VIDEO_MAP`.
- **`src/components/seo/photography/category/CategoryFeedShowcase.tsx`** — add `'wedding-dresses'` to `FeedSlug`, import `weddingDressesFeed`, add a `FEED_BY_SLUG` entry (eyebrow *"One gown · Whole feed"*, heading *"Your entire bridal feed from a single upload"*, sub copy, alt text).
- **`src/lib/visualLibraryDeepLink.ts`** — add `'wedding-dresses': { family: 'fashion', collection: 'wedding-dress' }` so the "Browse the visual library" CTA deep-links correctly.
- **`src/pages/seo/AIProductPhotographyCategory.tsx`** — add `'wedding-dresses'` to the `hidePainAndUseCases` slug list (matches the cleaner layout used by `activewear` / `hoodies` / `eyewear`).

### 4. Sitemap
`scripts/generate-sitemap.ts` already iterates `aiProductPhotographyCategoryPages`, so the new URL is picked up automatically on the next build — no script change needed.

## Out of scope
- No DB migrations (wedding-dress collection already populated, 44 scenes).
- No changes to the `/product-visual-library` page itself.
- No new dynamic template — page renders via the existing `AIProductPhotographyCategory.tsx`.

## Verification
After build, visit `/ai-product-photography/wedding-dresses` and confirm: hero collage renders (1 mp4 + 3 images), Feed Showcase shows the uploaded Instagram-style mosaic, scene examples load real bridal previews from the catalog, the "Browse the visual library" CTA deep-links to the wedding-dress collection.
