# Footer link to /ai-product-photography + image diversification on that page

## Problem

1. **Footer**: `/ai-product-photography` (the dedicated SEO landing page) has no link in `LandingFooter` — users can't navigate there.
2. **Image repetition on `/ai-product-photography`**: Three sections all pull from the same 10 `previewImage` IDs in `src/data/aiProductPhotographyCategories.ts`:
   - `PhotographyHero` marquee (uses `cat.previewImage` for every category)
   - `PhotographyCategoryChooser` cards (also uses `cat.previewImage`)
   - `PhotographySceneExamples` ("Scene library / 1600+ scenes") — hard-coded to the *same* 10 IDs as the categories data
   So the hero, the category chooser, AND the Scene library section show identical thumbnails.

## Fix

### 1. Add `/ai-product-photography` to the footer

`src/components/landing/LandingFooter.tsx` — add a new entry to the `Product` column (placed after "Visual Studio" so it sits alongside the other top-of-funnel routes):

```ts
Product: [
  { label: 'Visual Studio', to: '/features/workflows' },
  { label: 'AI Product Photography', to: '/ai-product-photography' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Virtual Try-On', to: '/features/virtual-try-on' },
  { label: 'Brand Profiles', to: '/features/brand-profiles' },
  { label: 'Image Upscaling', to: '/features/upscale' },
  { label: 'Perspectives', to: '/features/perspectives' },
  { label: 'Real Estate Staging', to: '/features/real-estate-staging' },
],
```

### 2. New, distinct image sets for Hero, Category Chooser, and Scene Library

Repository already has 60+ unique scene preview IDs across `HomeTransformStrip` (swimwear, eyewear, jackets, footwear, fragrance, watches). I'll use three non-overlapping pools so each section feels visually fresh.

**a. `PhotographyHero` (marquee)** — 12 editorial/dynamic shots, biased to motion and rich color. Replace the current `aiProductPhotographyCategories.map(...)` with an explicit hand-picked list:

```ts
const allTiles: Tile[] = [
  { label: 'Volcanic Sunset',      src: PREVIEW('repeated-shadow-grid-fragrance-1776013389735') },
  { label: 'Cliffside Walk',       src: PREVIEW('1776574208384-fmg2u3') },
  { label: 'Golden Horizon',       src: PREVIEW('1776574228066-oyklfz') },
  { label: 'Sunset Drive',         src: PREVIEW('1776102204479-9rlc0n') },
  { label: 'Movement Shot',        src: PREVIEW('1776690212460-cq4xnb') },
  { label: 'Office Flash',         src: PREVIEW('editorial-office-flash-eyewear-1776150153576') },
  { label: 'Yacht Bow',            src: PREVIEW('1776524132929-q8upyp') },
  { label: 'Dark Elegance',        src: PREVIEW('1776018020221-aehe8n') },
  { label: 'Old Money Portrait',   src: PREVIEW('1776691906436-3fe7l9') },
  { label: 'Studio Hero',          src: PREVIEW('1776770347820-s3qwmr') },
  { label: 'Beauty Closeup',       src: PREVIEW('beauty-closeup-oversized-eyewear-1776150210659') },
  { label: 'Soft Volume Lean',     src: PREVIEW('1776691911049-gsxycu') },
];
```

Add the `PREVIEW` helper (same Supabase URL pattern used elsewhere) at the top of the file. Drop the `aiProductPhotographyCategories` import.

**b. `PhotographyCategoryChooser`** — keep the data-driven loop but swap each category's `previewImage` in `src/data/aiProductPhotographyCategories.ts` to a **different** representative shot (so chooser cards no longer match hero or scene library). New mapping:

| Category | New preview ID |
|---|---|
| Fashion | `1776691909999-ra3rym` (side profile street) |
| Footwear | `1776770345914-cg8uyy` (geometric grid) |
| Beauty & Skincare | `aesthetic-beauty-closeup-eyewear-1776148096014` |
| Fragrance | `near-face-hold-fragrance-1776013185169` |
| Jewelry | `1776102176417-iih747` (candy flash) |
| Bags & Accessories | `1776856613338-h5sdvq` |
| Home & Furniture | `1776856604775-kxc92a` |
| Food & Beverage | `1776596629281-anqgf5` |
| Supplements & Wellness | `1776856607319-693vtg` |
| Electronics & Gadgets | `1776856609329-7k8ow1` |

**c. `PhotographySceneExamples`** ("1600+ scenes") — replace the 10 hard-coded `examples` with a new set drawn entirely from yet another pool, themed by the surrounding copy ("Studio, lifestyle, editorial, seasonal"):

```ts
const examples = [
  { label: 'Studio Hero',           category: 'Studio',     src: PREVIEW('1776770347820-s3qwmr') },
  { label: 'Architectural Stair',   category: 'Editorial',  src: PREVIEW('1776522769405-3v1gs0') },
  { label: 'Sunbathing Editorial',  category: 'Lifestyle',  src: PREVIEW('1776524131703-gvh4bb') },
  { label: 'Paris Curb Side',       category: 'Streetwear', src: PREVIEW('1776691907477-77vt46') },
  { label: 'Hard Shadow Hero',      category: 'Studio',     src: PREVIEW('hard-shadow-shoes-sneakers-1776008136691') },
  { label: 'Sunlit Tailored Chair', category: 'Editorial',  src: PREVIEW('1776691912818-yiu2uq') },
  { label: 'Frozen Aura',           category: 'Seasonal',   src: PREVIEW('1776018038709-gmt0eg') },
  { label: 'Coastal Camera',        category: 'Lifestyle',  src: PREVIEW('1776524128011-dcnlpo') },
  { label: 'Lounge Selfie',         category: 'Editorial',  src: PREVIEW('1776102190563-dioke2') },
  { label: 'Sunstone Wall',         category: 'Seasonal',   src: PREVIEW('1776574255634-kmhz9g') },
];
```

After the changes, **no scene image is duplicated across the three sections**.

## Files

- `src/components/landing/LandingFooter.tsx` — add "AI Product Photography" link in Product column
- `src/components/seo/photography/PhotographyHero.tsx` — replace marquee tile source with curated 12-shot list
- `src/data/aiProductPhotographyCategories.ts` — swap the 10 `previewImage` IDs to new shots
- `src/components/seo/photography/PhotographySceneExamples.tsx` — replace `examples` array with new 10 shots and re-themed labels (Studio / Editorial / Lifestyle / Streetwear / Seasonal)

## Out of scope

- No new images are generated or uploaded — all swaps reuse scene IDs already present in the project's Supabase preview bucket and referenced elsewhere in the codebase.
- No changes to category metadata, URLs, or descriptions — only the `previewImage` value per category.
