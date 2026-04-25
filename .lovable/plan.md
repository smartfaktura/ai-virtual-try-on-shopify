## Strict QA on /ai-product-photography + 10 category hubs

I went through every QA question. Below: pass/fail per question, then the **exact fixes I'll apply**. No fluff.

---

### 1. Footer balance
**Status:** Mostly pass, but Solutions only lists 4 of 10 categories — that wastes the SEO equity of the 6 hub pages we just built. Desktop has room (`lg:grid-cols-5`), and mobile shows footer columns in a 2-col grid that scrolls naturally — adding 6 more rows under one column does NOT create a link dump (it's a single tidy list per heading). Verdict: expand to all 10.

### 2. Footer link selection
Currently: Fashion, Footwear, Beauty & Skincare, Bags & Accessories + "All categories". Those 4 are commercial winners but the other 6 (Fragrance, Jewelry, Home & Furniture, Food & Beverage, Supplements & Wellness, Electronics & Gadgets) have full hub pages in the sitemap and need at least one sitewide internal link to crawl-prioritize them. **Fix: list all 10 + "All categories".**

### 3. Anchor text quality
- Card desktop: `Explore AI {Category} product photography` (e.g., "Explore AI Fashion product photography") — descriptive, not stuffed. ✅
- Card mobile: `Explore {Category}` — short, natural. ✅
- `aria-label` and `title` mirror the desktop anchor → assistive tech + crawler signal aligned. ✅
- Footer: short solution names ("Fashion Photography", etc.) — varied phrasing, not repeated. ✅

### 4. Duplicate-link risk
Counted internal links to category pages from the parent hub:
- Category chooser: 1 link per category
- Related-category cards on each category page: 3 sibling links
- Footer: 10 sitewide
That's natural. CTAs go to `/app/generate/product-images` and `/product-visual-library`, not to other categories — no over-linking loop. ✅

### 5. Mobile category section
Cards remain 2-col on mobile, `p-3.5`, 15px H3, hidden description, hidden shot count, short CTA. Tap target is the entire card (`<Link>` wraps everything) so accessibility/tappability is fine. Premium feel preserved. ✅

### 6. Image performance
- 3-image collage thumbs use `getOptimizedUrl(..., { quality: 60 })` and `loading="lazy" decoding="async"`. ✅
- Aspect-ratio reserved (`aspect-[16/9]` on outer, grid cells fill) → no CLS. ✅
- Hero LCP image is preloaded via `HeroPreload` + `fetchPriority="high"`. ✅

### 7. SEO semantics
- Each category page has exactly **one H1** (CategoryHero) — the parent hub also has one. ✅
- H2/H3 hierarchy is consistent across all sections. ✅
- No keyword stuffing — anchor variations differ across surfaces. ✅

### 8. Visual hierarchy
Hero CTA → category chooser → "one photo, many outputs" (visual system) → models → how it works → scenes → use cases → comparison → FAQ → final CTA. Clear. ✅

### 9. Broken routes
- 10 routes mapped via `:slug` route in `App.tsx`. ✅
- 10 slugs in `aiProductPhotographyCategoryPages.ts` match 10 in `aiProductPhotographyCategories.ts` (footer hub) match 10 in `public/sitemap.xml`. ✅
- Canonicals are set per-page in `SEOHead`. ✅
- `Navigate to="/ai-product-photography" replace` for unknown slugs — clean fallback, no 404 noise. ✅

### 10. External-expert top-3 remaining recommendations
1. Add **`Organization` + `WebSite` JSON-LD** sitewide (Search Console sitelinks search box, AI knowledge-graph hits). I'll add to `index.html`.
2. **Per-page Article/CollectionPage JSON-LD** on category pages (alongside breadcrumb + FAQ) — gives Google/AI crawlers a clearer entity for each hub.
3. **Internal contextual links between siblings** inside body copy (not just Related cards) — but this is a content task, not a code change. Leave for a follow-up.

---

### Bonus: AI crawler support (web + AI surfaces)
Current `robots.txt` only names Googlebot/Bingbot/Twitterbot/facebookexternalhit + wildcard. The wildcard already permits AI crawlers, but **explicit allow blocks per AI bot** signal intent and protect against future wildcard tightening. I'll add explicit blocks for: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended (controls Gemini training), Applebot, Applebot-Extended, Bytespider, Amazonbot, Meta-ExternalAgent, cohere-ai, DuckAssistBot, YouBot, MistralAI-User. Each gets `Allow: /` + `Disallow: /app/` (private app surface).

---

### Exact fixes I'll apply

**1. `src/components/seo/photography/PhotographyCategoryChooser.tsx`**
- Card H3: `text-foreground` → `text-[#1a1a2e]` (token consistency with the rest of the page).
- Card CTA inline link: `text-primary` → `text-[#1a1a2e]` (matches the new dark inline-link convention).

**2. `src/components/landing/LandingFooter.tsx`**
- Expand `Solutions` to all 10 categories + "All categories" so every hub page gets a sitewide internal link.

**3. `public/robots.txt`**
- Add explicit allow blocks for 18 major AI/LLM crawlers (listed above), each with `Disallow: /app/` to protect the private app.

**4. `index.html`**
- Add sitewide `Organization` and `WebSite` JSON-LD (with `potentialAction` SearchAction) inside `<head>`. Improves Knowledge Panel + AI grounding.

**5. `src/pages/seo/AIProductPhotographyCategory.tsx`**
- Add a `CollectionPage` JSON-LD per category (name, description, isPartOf the parent hub, hasPart links to the 3 related categories) alongside the existing Breadcrumb JSON-LD. Cheap to add, real schema benefit.

No design changes. No data migrations. No new dependencies.
