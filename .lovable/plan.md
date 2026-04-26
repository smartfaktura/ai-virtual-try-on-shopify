## Advanced SEO audit — VOVV.AI homepage `/`

### Scores (1–10)
- SEO foundation: **9** (canonical, OG, Twitter, robots, sitemap, multi-block JSON-LD all present)
- Keyword strategy: **8** (homepage is broad/brand; landing pages own intent terms — clean separation)
- Internal linking: **7.5** → **9** after fixes (add nav item + 2 anchor links from bottom-of-page)
- Technical SEO: **9** (no noindex, canonical points to https://vovv.ai/, sitemap healthy, robots.txt exemplary)
- Page speed: **8** (lazy-loaded marquees, preconnect to Supabase, preload critical tiles, autoplay video uses preload="metadata")
- Content clarity: **7.5** → **9** after fixes (brand name needs to appear earlier in body copy)
- Conversion strength: **8** (clear CTAs, free-credit trust line, visible examples)
- Design quality: **9** (premium, spacious, on-aesthetic with /home)

### Cannibalization check — PASS
| Page | Title | Primary keyword |
|---|---|---|
| `/` | "VOVV.AI \| AI Product Visuals for E-commerce Brands" | brand + platform |
| `/ai-product-photography` | "AI product photography" | SEO hub |
| `/ai-product-photo-generator` | "AI product photo generator" | tool intent |

Three pages have distinct titles, distinct H1s, and the homepage links *into* the others with descriptive anchors — no cannibalization.

---

### Safe fixes I'll apply now

**1. `src/components/home/HomeHero.tsx` — brand in first paragraph**
- Desktop subheadline starts with "VOVV.AI helps e-commerce brands turn one product photo into product page images, lifestyle visuals, ads, and campaign-ready creative."
- Mobile subheadline gets "VOVV.AI" prefix too.
- Adds "VOVV.AI" to the first 50 visible body words → entity SEO win.
- Hero marquee `alt` text upgraded from generic ("Editorial", "Studio") to descriptive ("Brown dress editorial campaign — flash night fashion shot", etc.) on the original product card; keeps lazy + responsive behavior.

**2. `src/components/landing/LandingNav.tsx` — add AI Product Photography to nav**
- Add `{ label: 'AI Product Photography', href: '/ai-product-photography', isRoute: true }` between "Explore" and "Scene Library".
- This single nav link gives the most important SEO hub a sitewide nav-position internal link, lifting its rank potential significantly.
- Adds prefetch for the route's chunk.

**3. `src/components/home/HomeFinalCTA.tsx` — add SEO links to bottom CTA**
- H2 → "Start creating with VOVV.AI" (brand-anchored).
- Below the two existing CTAs, add a small text row of 3 descriptive links:
  - "Explore AI product photography" → /ai-product-photography
  - "Try the AI product photo generator" → /ai-product-photo-generator
  - "Create Shopify product photos" → /shopify-product-photography-ai
- Bottom-of-page links carry strong PageRank to the priority pages.

**4. `src/components/home/HomeWhySwitch.tsx` — keyword-aligned H2**
- H2 → "Why e-commerce brands choose VOVV.AI" (was: "Replace slow content production").
- Reinforces brand entity + target audience for Google.

**5. `src/components/home/HomeFAQ.tsx` — add "Who is VOVV.AI for?" question**
- Inserts as second FAQ. Answers: "VOVV.AI is built for e-commerce brands, DTC founders, marketing teams, and agencies that need a steady supply of on-brand product visuals — without the cost or schedule of traditional photoshoots."
- `homeFaqs` is already exported, so JSON-LD `FAQPage` schema updates automatically (no schema mismatch).

**6. Hero marquee — natural alt text**
- Original card alt: "Brown dress original product photo before AI editing"
- Other cards alt format: "{Label} — AI-generated brown dress visual" (currently just `{label}`).

---

### Things I'm NOT changing (already correct)
- Schema blocks — Organization, WebSite (with SearchAction), SoftwareApplication, FAQPage — no conflicts.
- Canonical (`https://vovv.ai/`) — correct.
- Sitemap — all key pages listed at sensible priorities.
- robots.txt — explicit LLM crawler allowlist already in place.
- Footer — already grouped well; not a link dump.
- Section order — already matches recommended pattern.
- Image lazy loading + preconnect/preload on Supabase storage — already optimal.
- `<html lang="en">` — confirmed.

### Search Console queries to monitor
**Should rank for** (homepage primary):
- `vovv ai`, `vovv.ai`, `vovv ai platform`
- `ai product visuals`, `ai product visuals for ecommerce`
- `ai product visual platform`, `ai visuals for shopify brands`

**Watch for cannibalization signals** (homepage stealing impressions from the hubs):
- If `/` outranks `/ai-product-photography` for `ai product photography` → tone down keyword density on the homepage hero/H2s.
- If `/` outranks `/ai-product-photo-generator` for `ai product photo generator` → ensure homepage doesn't say that exact phrase anywhere (currently it doesn't).
- If `/` ranks for `shopify product photography ai` → ensure /shopify-product-photography-ai has a stronger H1 + first-paragraph match.

### Top recommendations not auto-applied
1. Add a customer logo strip (no real social proof on `/` yet).
2. Validate JSON-LD with Google Rich Results Test after deploy.
3. When testimonials are available, add 2–3 with `Review` schema.
4. Consider a `BreadcrumbList` schema only on subpages (not homepage — homepage is the root).
5. Add hreflang only if multi-region rollout is planned.

### Files touched (5)
1. `src/components/home/HomeHero.tsx` — brand-led subheadline + descriptive marquee alts
2. `src/components/landing/LandingNav.tsx` — add "AI Product Photography" nav item
3. `src/components/home/HomeFinalCTA.tsx` — SEO links + brand-anchored H2
4. `src/components/home/HomeWhySwitch.tsx` — keyword-aligned H2
5. `src/components/home/HomeFAQ.tsx` — add "Who is VOVV.AI for?" question

Plus version.json bump.
