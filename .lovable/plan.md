## New public page — `/product-visual-library`

A premium, public-facing visual library that surfaces every Step 2 ("Shots") scene from `/app/generate/product-images`. Sourced live from `public.product_image_scenes` so admin edits flow through automatically.

---

### 1. Database — public read access (safe, slim)

Migration adds an `anon` SELECT policy restricted to active rows. No PII, no prompt IP exposure (handled at query level by selecting only safe columns).

```sql
CREATE POLICY "Public can read active scenes"
  ON public.product_image_scenes FOR SELECT TO anon
  USING (is_active = true);
```

Admin write policies stay untouched.

---

### 2. Lightweight public data hook — `src/hooks/usePublicSceneLibrary.ts`

NEW dedicated query (does NOT reuse the wizard hook, which loads heavy `prompt_template` data).

- Selects only safe columns: `scene_id, title, description, category_collection, sub_category, preview_image_url, sort_order, category_sort_order, sub_category_sort_order`
- `prompt_template`, `trigger_blocks`, `outfit_hint` etc. are NEVER exposed publicly
- Paginates 1000 rows at a time, sorts by `category_sort_order, sub_category_sort_order, sort_order`
- React Query cache key `['public-scene-library']`, `staleTime: 10min`
- Returns: `{ scenes, families, isLoading }` where `families` is a pre-grouped tree:
  ```ts
  Family { slug, label, totalCount, previewThumbs[3], collections: SubFamily[] }
  SubFamily { slug, label, totalCount, subGroups: { label, scenes }[] }
  ```
- Family grouping uses existing `CATEGORY_FAMILY_MAP` from `src/lib/sceneTaxonomy.ts`

Payload size: ~300KB for ~1000 rows (vs 3-5MB with prompts).

---

### 3. Route + nav

- **`src/App.tsx`**: register `<Route path="/product-visual-library" element={<ProductVisualLibrary />} />` in the public routes block.
- **`src/components/landing/LandingNav.tsx`**: insert `{ label: 'Explore Visuals', href: '/product-visual-library', isRoute: true }` as the first nav link.

---

### 4. Page composition — `src/pages/ProductVisualLibrary.tsx`

Single-route, scroll-anchored sections:

**Hero** (`#top`)
- Eyebrow: "AI Product Visual Library"
- H1: "Explore AI Product Visuals for Every Category"
- Subtitle from spec
- Primary CTA: auth-aware — logged-in → "Create Product Visuals" → `/app/generate/product-images`; logged-out → "Create Free Visuals" → `/auth?next=/app/generate/product-images`
- Secondary CTA: "Browse Categories" → smooth-scroll `#categories`
- Warm cream background matching `/home` aesthetic

**Category overview** (`#categories`)
- H2: "Built for every kind of ecommerce product" + spec subtitle
- 7 family cards: Fashion & Apparel, Footwear, Bags & Accessories, Jewelry, Beauty & Fragrance, Food & Drink, Home & Lifestyle
- Each card: 3-thumb preview collage (from family's first scenes), family name, total scene count, "Explore category →" anchor → scrolls to `#cat-{family-slug}`

**Active visual catalog** (`#catalog`)
- **Desktop ≥lg**: sticky left rail (`top-24 w-60`, pure CSS sticky — no scroll listeners) listing families with sub-category counts
- **Mobile**: horizontally scrollable family pills + per-family expandable sub-category pills
- **Search bar** above grid — client-side `useMemo` filter on title + sub-category (case-insensitive contains, <5ms for 1000 items)
- **Per-family sections**: each family rendered as `<section id="cat-{slug}">` with family heading; inside, sub-categories rendered as labelled rows (`Essential Shots`, `Creative Shots`, `On-Body`, etc., directly from `subGroups[].label`)
- **Progressive mounting**: first 2 families mount immediately (above fold), remaining families mount when their sentinel hits viewport (`IntersectionObserver`, 600px rootMargin) — first paint shows ~80 cards, not 1000
- **Grid**: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4`
- **Card**: fixed `aspect-[3/4]`, `loading="lazy"`, `decoding="async"`, `getOptimizedUrl(url, { quality: 60 })`, neutral `bg-[#efece8]` placeholder, `onError` hides broken images, title (1-line truncate), tiny sub-category tag

**Premium scene modal** (Radix Dialog)
- Opens on card click
- Single optimized hero image (`getOptimizedUrl(url, { width: 1200, quality: 75 })`) — preloaded only on click
- Title, family label, sub-category label
- Short description (column value or friendly fallback)
- "What you can create with this" — chips: Product page · Social media · Ads · Campaign visuals · Editorial content
- Helper text: "Upload your product photo and VOVV.AI will adapt this visual direction to your product."
- Auth-aware CTA:
  - Unauthenticated → "Sign up and create free" → `/auth?next=/app/generate/product-images?scene={scene_id}`
  - Authenticated → "Create this visual" → `/app/generate/product-images?scene={scene_id}`

**SEO copy block** (pre-footer)
- 4 H3 sections from spec, 1 paragraph each — real text content for crawlers
- "AI product visuals for ecommerce brands" / "Create product visuals by category" / "From one product photo to campaign-ready visuals" / "Product visuals for fashion, beauty, footwear, jewelry, food, home, tech, and more"

**Footer**: reuse `<LandingFooter />`

---

### 5. SEO

- `<SEOHead title="AI Product Visual Library for Ecommerce Brands | VOVV.AI" description="Browse 1,000+ AI product visual ideas across fashion, footwear, beauty, jewelry, food, home, tech, accessories, and more. Upload one product photo and create brand-ready visuals with VOVV.AI." canonical="https://vovv.ai/product-visual-library" />`
- `<JsonLd>` `CollectionPage` schema with `numberOfItems` = active scene count

---

### 6. Performance guarantees

| Concern | Mitigation |
|---|---|
| Heavy payload | Slim 9-column query (~300KB vs 3-5MB) |
| 1000+ DOM nodes on first paint | Progressive family mounting via `IntersectionObserver` |
| Image bandwidth | `loading="lazy"` + `decoding="async"` + quality=60 thumbs |
| Layout shift | Fixed `aspect-[3/4]` cards + skeletons during load |
| Sticky sidebar jank | Pure CSS `position: sticky` (no scroll listeners) |
| Modal full-image cost | Loaded only on click, separate optimized URL |
| Cross-page navigation | Distinct cache key — doesn't conflict with wizard cache |
| Broken image URLs | `onError` handler hides `<img>`, placeholder remains |

---

### 7. Files

**NEW**
- Migration: `add public select policy on product_image_scenes`
- `src/hooks/usePublicSceneLibrary.ts` — slim public query + family grouping
- `src/pages/ProductVisualLibrary.tsx` — page composition
- `src/components/library/LibrarySidebarNav.tsx` — desktop sticky / mobile pills nav
- `src/components/library/SceneCard.tsx` — premium grid card
- `src/components/library/SceneDetailModal.tsx` — Radix dialog with auth-aware CTA
- `src/components/library/CategoryOverviewCard.tsx` — family card with thumb collage

**EDIT**
- `src/App.tsx` — register route
- `src/components/landing/LandingNav.tsx` — add "Explore Visuals" link

**NO EDITS** to wizard or scene data layer — fully isolated.