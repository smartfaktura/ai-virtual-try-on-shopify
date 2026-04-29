# Add 6 new SEO category pages: Bags, Watches, Hoodies, Swimwear, Lingerie, Eyewear

## Goal
Spin up 6 new `/ai-product-photography/{slug}` pages that look and behave exactly like `/ai-product-photography/footwear`, using real on-topic scenes from the live `product_image_scenes` catalog. Wire them into the SEO admin, footer, deep-link map, and sitemap.

## Architecture (no new pages, no new components)
The `/ai-product-photography/:slug` route (`src/pages/seo/AIProductPhotographyCategory.tsx`) is fully data-driven from `aiProductPhotographyCategoryPages.ts`. The SEO admin (`/admin/seo-page-visuals`) and sitemap auto-derive entries from that same file. So adding the pages = adding data.

## Files to change

### 1. `src/data/aiProductPhotographyCategoryPages.ts` — append 6 entries
For each new slug add a full `CategoryPage` object (hero, collage, 8 scene examples, visual outputs, use cases, FAQs, related categories) following the existing `footwear`/`fashion` shape. Real `imageId`s confirmed from the DB:

- **bags** — hero `1776239449949-ygljai`. Scenes from `bags-accessories`: Sculptural Studio Hero, Wind Shoulder, Architectural On-Body, Hardware Closeup, Reclined Studio, Luxury Couch Still, Cafe Errand UGC, Distant Horizon Campaign. Related: `bags-accessories, fashion, footwear, jewelry`.
- **watches** — hero `1776596240525-wafgtx`. Scenes from `watches`: Motion Blur Hero, Wrist Beauty Portrait, Dial Closeup, Earthy Glow, Frozen Aura, Daily Luxury Cuff, Super Editorial Campaign, Dynamic Water Splash. Related: `bags-accessories, jewelry, eyewear, bags`.
- **hoodies** — hero `1776847998023-tof7el`. Scenes from `hoodies`: Ghost Mannequin, Boucle Lounge, Outfit Mirror Selfie, Graphic Hero, Crosswalk View, Tarmac Walk, Color Lounge, Rail Still. Related: `fashion, footwear, bags, bags-accessories`.
- **swimwear** — hero `1776246297359-aecrip`. Scenes from `swimwear`: Sunlit Arch, Aesthetic Color Editorial Hero, Sun Lounger, Towel Wrap, Floating Pool, Folded on Towel Still, Yacht Deck, Cabana Curtain. Related: `fashion, lingerie, bags, bags-accessories`.
- **lingerie** — hero `1776242908181-27a0zd`. Scenes from `lingerie`: Sunlit Skin Hero, Soft Standing Silhouette, Sheet Wrap Portrait, Coffee in Bed, Folded Lace Still, Silk Movement, Vanity Mirror Minimal, Morning Mirror UGC. Related: `fashion, swimwear, beauty-skincare, fragrance`.
- **eyewear** — hero `beauty-closeup-oversized-eyewear-1776150210659`. Scenes from `eyewear`: Beauty Closeup, Office Flash, Sunset Drive, Stair Selfie, Cafe Film, Lounge Selfie, Handheld Frame, Volcanic Sunset. Related: `bags-accessories, watches, fashion, jewelry`.

Copy mirrors the polished tone of `footwear`: SEO title, meta, H1 lead/highlight, hero eyebrow + subheadline, primary/secondary/long-tail keywords, subcategories, pain points, 8 visual outputs, 6 use cases, 5 FAQs, 4-tile hero collage, `heroNoun` (bag/watch/hoodie/swimsuit/piece/frame).

### 2. `src/data/aiProductPhotographyBuiltForGrids.ts` — add 6 entries to `BUILT_FOR_GRIDS`
Add chip-rail groups (~5 chips × 6–8 cards each) so the "Built for every X shot" section renders. All `imageId`s pulled from the DB dump. Subgroup splits per slug:
- **bags** — Editorial Studio · On-Body · Campaign · Hardware · Essentials · UGC
- **watches** — Editorial Studio · On-Wrist Portraits · Creative · Essentials · Lifestyle
- **hoodies** — Essentials · UGC · Lifestyle · Graphic Campaigns · Travel · Stills
- **swimwear** — Resort Editorial · Color Stories · Beach UGC · Stills · Essentials
- **lingerie** — Studio · Boudoir · Lifestyle · Campaign · Stills · Essentials
- **eyewear** — Editorial Portraits · Aesthetic Color · Vintage Film · Brutalist UGC · Creative · Essentials

(Hand-edit is safe — the file's "auto-generated" header is informational, the script just rebuilds it; new keys will survive a regen if the script picks them up next time.)

### 3. `src/lib/visualLibraryDeepLink.ts` — add 6 mappings
Each new slug gets a `family`/`collection` mapping so the "Browse the visual library" CTA on the page deep-links to the right catalog filter:
- `bags` → `family: bags-and-accessories, collection: bags`
- `watches` → `family: bags-and-accessories, collection: watches`
- `eyewear` → `family: bags-and-accessories, collection: eyewear`
- `hoodies` → `family: fashion, collection: hoodies`
- `swimwear` → `family: fashion, collection: swimwear`
- `lingerie` → `family: fashion, collection: lingerie`

### 4. `src/components/landing/LandingFooter.tsx` — add 6 links to "Categories" group
Append after the existing "Electronics & Gadgets" link:
- Bags Product Photography → `/ai-product-photography/bags`
- Watch Product Photography → `/ai-product-photography/watches`
- Hoodie Product Photography → `/ai-product-photography/hoodies`
- Swimwear Product Photography → `/ai-product-photography/swimwear`
- Lingerie Product Photography → `/ai-product-photography/lingerie`
- Eyewear Product Photography → `/ai-product-photography/eyewear`

### 5. `public/sitemap.xml` — regenerate
Run the existing `scripts/generate-sitemap.ts` (no script change needed — it iterates `aiProductPhotographyCategoryPages`, so the 6 new URLs land automatically with image-rich entries). Update `public/llms.txt` only if it lists category URLs.

## What auto-updates (no work needed)
- `/admin/seo-page-visuals` admin UI — `seoPageVisualSlots.ts` derives `categoryEntries` from `aiProductPhotographyCategoryPages`, so each new page automatically gets editable slots: hero, 4 collage tiles, 8 scene examples, "Built for" tiles per chip group, related-category thumbs.
- Route handling — `/ai-product-photography/:slug` already matches new slugs.
- Related-categories cross-linking — existing pages link to `bags-accessories` / `fashion`; new pages link back to those plus to each other.

## Out of scope
- Not touching `aiProductPhotographyCategories.ts` (the 10-card hub on `/ai-product-photography`) — it stays at 10 parent groups; new pages are accessible via footer + cross-links + direct URL + sitemap.
- No DB migration. All scene IDs already exist in `product_image_scenes`.
- No edge-function or auth changes.

## Safety
- Pure additive data changes; existing 10 pages, hub, admin, and footer untouched.
- Every `imageId` was verified against `product_image_scenes` in the live DB; preview URLs resolve to existing JPGs (no PNG entries needed).
- Unknown `relatedCategories` slugs are filtered out by `getRelatedPages`, so cross-links never 404.
- If a new slug isn't in `BUILT_FOR_GRIDS` the section renders nothing — but we're adding entries for all 6.

## Verification
1. Visit `/ai-product-photography/bags`, `/watches`, `/hoodies`, `/swimwear`, `/lingerie`, `/eyewear` — full page renders with on-topic hero, scenes, chip rail, related categories, FAQ.
2. `/admin/seo-page-visuals` lists the 6 new pages with all slots editable.
3. Footer "Categories" column shows 6 new links and they navigate correctly.
4. Sitemap.xml contains the 6 new `<url>` entries with `<image:image>` blocks.
5. "Browse the visual library" CTA on each new page deep-links to the right catalog filter.
