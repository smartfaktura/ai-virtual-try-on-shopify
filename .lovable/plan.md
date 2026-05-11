# Generic Brand Sample Showcase

Create a reusable, noindex sample landing page modeled after `/showcase/brite` that you can send to fashion brands as a "here's what we'd do for you" preview. Uses all 30 Dresses category preview images mixed into one editorial grid.

## Route

- New page: `/showcase/brandname` (literal placeholder slug — easy to duplicate later as `/showcase/zara`, etc.)
- Registered in `src/App.tsx` next to the existing Brite route, lazy-loaded
- `noindex` via `SEOHead`

## File

`src/pages/showcase/BrandSampleShowcase.tsx` — same structure/styling language as `BriteShowcase.tsx`:

1. **Hero**
   - Eyebrow: `PREPARED FOR YOUR BRAND`
   - H1: `A glimpse of your dress collection, reimagined`
   - Subhead: "From a single product photo, VOVV.AI generates a complete editorial library — campaign, on-model, essentials and detail shots. Below is a sample built from our Dresses scene library."

2. **Stats row** (3 cards, same style as Brite)
   - `30` Sample Visuals
   - `~60s` Generation Time
   - `2` Scene Categories (Editorial Portraits + Essential Shots)

3. **Gallery**
   - Pulls all 30 Dresses preview images (hardcoded inline array of `{ url, scene, category }` — same pattern as Brite, no DB dependency at runtime)
   - Order shuffled deterministically so Editorial Portraits and Essential Shots are mixed (not grouped) for a richer first impression
   - 2 / 3 / 4-col responsive grid, 4:5 aspect, hover overlay shows scene title + small category label
   - Click → lightbox (reuse Brite's lightbox pattern)

4. **Mid CTA strip** (new, not in Brite)
   - One line: "This is a sample. Your real collection would feature your products, your fit, your fabric — generated in minutes."

5. **Final CTA** (same dark `#0f172a` block as Brite)
   - H2: `Want this for your brand?`
   - Sub: "Send us one product photo and we'll build your visual library."
   - Buttons: `Try free now` → `/auth`, `Explore more examples` → `/discover`

## Image source

All 30 URLs already live at `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/...` (pulled from `product_image_scenes` where `category_collection='dresses'` and `is_active=true`). Hardcoded in the component so the page is fully static and load-fast.

## Out of scope

- No CMS/dynamic brand prop (you asked for one sample page; if you later want `/showcase/[slug]` driven by params, that's a follow-up)
- No DB or edge function changes
- No nav link added (page is meant to be sent privately, like Brite)
