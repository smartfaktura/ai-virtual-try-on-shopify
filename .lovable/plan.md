## Homepage SEO + CRO improvements

After auditing `/` (now serving `Home.tsx`), the page is visually strong but has clear gaps for organic SEO and internal linking. Below are the targeted fixes.

---

### What's already good
- Clean `LandingNav` + `LandingFooter` (footer covers /ai-product-photography, /ai-product-photo-generator, all category hubs, Shopify, comparisons — strong link equity from footer).
- Single H1, sensible H2 hierarchy across sections.
- `SEOHead` correctly emits canonical, OG, Twitter, robots.
- Canonical now points to `SITE_URL` (root).
- Hero images lazy-loaded; preconnect/preload to Supabase storage; FCP-friendly.
- `id="examples"`, `id="how-it-works"`, `id="faq"`, `id="pricing"` anchors all wired correctly.

### What I'll change (concrete edits, all safe)

**1. `src/components/home/HomeHero.tsx` — sharpen H1 for SEO + add positioning**
- New H1: `AI product visuals for e-commerce brands.` (static, crawlable, on-keyword) — keep typewriter as a sub-line below H1, not inside it.
- Subheadline upgrade: `Turn one product photo into product page images, lifestyle visuals, ads, and campaign-ready creative — built for DTC and e-commerce teams.`
- Add a third small trust line: `No photoshoot needed · Built for e-commerce brands · Start from one product photo.`
- Keep both existing CTAs ("Try it on my product" → /auth, "See examples" → #examples).

**2. `src/components/home/HomeTransformStrip.tsx` — convert category pills to crawlable links**
- Each pill (Watches, Swimwear, Footwear, Jackets, Eyewear, Fragrance) becomes an `<a href="/ai-product-photography/{slug}">` while still toggling the grid via a small click handler that does `e.preventDefault()` only when modifier keys aren't pressed (so cmd-click opens the hub page in a new tab and Google crawls the href).
- Map: watches → `jewelry` (closest hub), swimwear → `fashion`, footwear → `footwear`, jackets → `fashion`, eyewear → `bags-accessories`, fragrance → `fragrance`.
- Add a section-level link below the grid: `Explore AI product photography` → `/ai-product-photography` (descriptive anchor).
- Update H2 from "Built for every category." → "Explore AI product photography by category." (keyword-rich, descriptive).

**3. `src/components/home/HomeCreateCards.tsx` — add deep links per format card**
- "Product page images" card → small text link "Explore AI product photography" → `/ai-product-photography`
- "Social & ad creatives" card → "Create Shopify product photos" → `/shopify-product-photography-ai`
- "Product videos" card → keep CTA only (no SEO hub yet).
- Section H2 stays but supporting copy adds: "From one product photo to product page visuals, ads, and campaigns."

**4. `src/components/home/HomeFAQ.tsx` — add brand FAQ + export array**
- Prepend new question: "What is VOVV.AI?" with a clear positioning answer that mentions e-commerce, one product photo, and outputs.
- `export const homeFaqs` so the schema in `Home.tsx` stays in sync with visible content.

**5. `src/pages/Home.tsx` — meta + JSON-LD**
- Meta title → `VOVV.AI | AI Product Visuals for E-commerce Brands` (62 chars).
- Meta description → `Turn one product photo into product page images, lifestyle visuals, ads, and campaign-ready creative with VOVV.AI — built for e-commerce brands.`
- Replace single `WebApplication` JSON-LD with three blocks:
  - `Organization` (name, url, logo, sameAs)
  - `WebSite` (with `SearchAction` pointing at `/discover?q={search_term_string}`)
  - `SoftwareApplication` (replaces current WebApplication; better Google match for SaaS)
  - `FAQPage` built from imported `homeFaqs` array (matches visible FAQ exactly, so no schema mismatch warning).

**6. `src/components/home/HomeEnvironments.tsx`** — change "Browse the full scene library" CTA's surrounding paragraph to add a secondary text link: `Or explore AI product photography by category` → `/ai-product-photography`.

---

### What I'm intentionally NOT changing
- Footer (already comprehensive, just restructured last round — no changes).
- Nav (current minimal structure is fine for top of funnel).
- Image optimization (already lazy + WebP via Supabase render endpoint + preload critical tiles).
- Sitemap (already lists `/` at priority 1.0; no `/home` entry to remove).
- Any component styling, layout, or section ordering.

---

### Cannibalization check
After these edits, the three pages have clear separation:

| Page | Primary keyword | Intent |
|---|---|---|
| `/` | "AI product visuals for e-commerce brands" | Brand + platform |
| `/ai-product-photography` | "AI product photography" | SEO hub + categories |
| `/ai-product-photo-generator` | "AI product photo generator" | Tool intent |

Homepage will link **into** the other two with descriptive anchors, not compete with them.

---

### Files touched (6)
1. `src/components/home/HomeHero.tsx` — H1 + subline + trust line
2. `src/components/home/HomeTransformStrip.tsx` — pills to links + section anchor link + H2
3. `src/components/home/HomeCreateCards.tsx` — deep link per card
4. `src/components/home/HomeFAQ.tsx` — add brand FAQ + export array
5. `src/components/home/HomeEnvironments.tsx` — secondary text link
6. `src/pages/Home.tsx` — meta + multi-block JSON-LD

Plus `public/version.json` bump.

### Top-5 expert recommendations not auto-applied
1. Add a real customer logo strip (currently no social proof on `/`).
2. Add a /sitemap.xml entry for /why-vovv and /roadmap (separate audit).
3. Consider migrating SEOHead to react-helmet-async for SSR-friendly meta (Lovable previews are CSR — Google does render JS, but server-rendered meta is more reliable).
4. Add hreflang if you plan multi-region.
5. Move the typewriter out of `<h1>` permanently (done in this plan) — dynamic H1 text is a known SEO anti-pattern.
