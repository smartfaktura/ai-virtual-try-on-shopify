## Add 3 new SEO category pages: Activewear, Dresses, Caps & Hats

Mirrors the just-shipped Bags / Watches / Hoodies / Swimwear / Lingerie / Eyewear pattern. All image IDs verified present in storage as JPGs. All routing infra (`/ai-product-photography/:slug`, admin slot registry, hero preload) auto-handles new entries.

### 1. `src/data/aiProductPhotographyBuiltForGrids.ts`
Append three new top-level keys with 4 grouped chips × 8 tiles each (32 scene tiles per category), reusing verified IDs from `product_image_scenes`:

- **`activewear`** — Editorial Sport Poses · Aesthetic Color Sets · Lifestyle & Studio · Creative Editorial
- **`dresses`** — Editorial Portraits · Quiet Luxury Locations · Studio Editorial · Essential PDP Shots
- **`caps-hats`** — Lifestyle Editorial · Aesthetic Color Film · Essential PDP Shots · Creative Shots

### 2. `src/data/aiProductPhotographyCategoryPages.ts`
Append 3 entries before the closing `];`. Each follows the existing schema (slug, url, groupName, seoTitle, metaDescription, h1Lead/Highlight, heroEyebrow/Subheadline, primary/secondary/longTail keywords, subcategories, painPoints, visualOutputs[8], sceneExamples[8], useCases[6], faqs[5], relatedCategories[4], heroImageId, heroAlt, heroNoun, heroCollage[4]).

Hero collage anchors:
- **activewear** → hero `1776231751417-v0kjpy` (Aesthetic Sport Hero); collage Sport / Aesthetic / Lifestyle / Studio
- **dresses** → hero `1776689322212-9lsvah` (Super Editorial Campaign); collage Editorial / Location / Studio / Lifestyle
- **caps-hats** → hero `1776077321082-njy85m` (Brim Grip Portrait); collage Lifestyle / Aesthetic / Essential / Creative

Related categories chosen for cross-link relevance (e.g. activewear → fashion, swimwear, hoodies, footwear; dresses → fashion, lingerie, swimwear, jewelry; caps-hats → fashion, hoodies, eyewear, bags-accessories).

### 3. `src/lib/visualLibraryDeepLink.ts`
Add 3 entries to the map:
```ts
'activewear': { family: 'fashion', collection: 'activewear' },
'dresses':    { family: 'fashion', collection: 'dresses' },
'caps-hats':  { family: 'bags-and-accessories', collection: 'hats-small' },
```

### 4. `src/components/landing/LandingFooter.tsx`
Append 3 links to the Categories column:
```tsx
{ label: 'Activewear Product Photography', to: '/ai-product-photography/activewear' },
{ label: 'Dresses Product Photography',    to: '/ai-product-photography/dresses' },
{ label: 'Caps & Hats Product Photography', to: '/ai-product-photography/caps-hats' },
```

### 5. Regenerate sitemap
Run `bunx tsx scripts/generate-sitemap.ts` to register the 3 new URLs + image entries.

### Auto-wired (no changes needed)
- **Admin `/app/admin/seo-page-visuals`** — `seoPageVisualSlots.ts` iterates `aiProductPhotographyCategoryPages` and auto-emits hero, collage, BuiltFor and SceneExamples slots for each page.
- **Route** — `/ai-product-photography/:slug` already covers all new slugs.
- **Hero preload** — already collage-aware from the previous performance fix.
- **`getBuiltForGroupsForPage(slug)`** — already reads from `BUILT_FOR_GRIDS[slug]`.

### Out of scope
- No copy / scene reuse from existing pages — every page gets unique pain points, FAQs, visual-output bullets, and a curated 8-scene set tailored to its niche.
- No PNG_PREVIEW_IDS additions — all 100+ image IDs verified `.jpg`.
