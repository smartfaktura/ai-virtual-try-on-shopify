# SEO audit (plain English) + proposed cleanup

## What's actually live on your public pages

**Static `index.html` (served to every bot, even ones that don't run JS)**
- Page title + meta description (homepage-style)
- Open Graph + Twitter card tags with social image
- Organization JSON-LD (name, logo, social links)
- WebSite JSON-LD with SearchAction
- Google Tag Manager + gtag analytics
- Font + LCP image preload
- No `<link rel="canonical">` on purpose — each route sets its own at runtime

**Per-route metadata (`SEOHead.tsx`)**
- Used on every important public page: Home, Pricing, How it works, Why VOVV, FAQ, Blog, all `/features/*`, all `/seo/*` (Shopify, Etsy, vs Studio, vs Photoshoot, AI Product Photography + 10 category pages), Discover, Freestyle, Library, About, Team, Careers, Contact, Press, Changelog, Roadmap, Help, legal pages
- Sets unique title, description, canonical, OG, Twitter, robots — works for Google's two-stage rendering
- Does NOT use `react-helmet-async` (Lovable's recommendation). It writes directly to `document.head` via `useEffect`. Functionally fine for Google but less safe than Helmet (race conditions on fast route changes, no SSR-friendly output, harder to test)

**Structured data (`JsonLd.tsx`)**
- Used on FAQ, Blog, BlogPost, Pricing, Home, How it works, Why VOVV, Roadmap, PublicFreestyle, FeaturesFreestyle, plus FAQAccordions on category/landing pages
- Same pattern: appended at runtime via `useEffect`

**Crawler files**
- `robots.txt` — explicit allowlist for Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot, Applebot, Bytespider, Amazonbot, Meta-ExternalAgent, etc. `/app/`, `/auth`, `/onboarding`, `/reset-password`, `/upload/` blocked. Sitemap referenced
- `llms.txt` — clean machine-readable summary of pages, categories, comparisons, blog
- `sitemap.xml` — auto-generated at build (~417 URLs, 369 image entries, real `lastmod` from Supabase data, image sitemap namespace)

## What's good (keep it)

1. Sitemap is comprehensive, fresh on every build, includes images
2. `robots.txt` and `llms.txt` align with Lovable's GEO guidance
3. Per-page titles/descriptions/canonicals exist on every public route
4. JSON-LD on the pages where it matters (FAQ, BlogPost, Organization, WebSite)
5. Open Graph + Twitter tags are in static HTML so social previews work without JS

## What's worth cleaning up or improving

1. **Stale comment in `index.html`** still references `scripts/prerender.ts` and "prerendered routes" — that script was deleted. Misleading future readers
2. **`SEOHead.tsx` doesn't use `react-helmet-async`** — Lovable's official SEO/GEO guide explicitly recommends it. Current DOM-mutation approach works for Google (which executes JS) but:
   - Has a tiny race-condition window on route change before the `useEffect` runs
   - Bots that don't execute JS see only the homepage title/description from `index.html`
   - Switching to Helmet wraps everything in a tested abstraction, plus prepares us for any future SSR/static-HTML option
3. **No per-page canonical on a few public pages**: I can audit and confirm every public route in `App.tsx` has `<SEOHead canonical=...>`. Flagged candidates to verify: `/about`, `/team`, `/careers`, `/contact`, `/press`, `/changelog`, `/help`, `/status`, `/privacy`, `/terms`, `/cookies`, `/discover/:slug`, `/blog/:slug`
4. **Stale build/SEO artifacts to remove (no longer used after we dropped Puppeteer)**:
   - `.lovable/plan.md` Phase notes about prerender (already obsolete)
   - Comment block in `index.html` about prerender
   - Confirm `scripts/prerender.ts` and `validate-prerender.ts` are gone (they are)
5. **`package-lock.json`** still exists alongside `bun.lock`. The npm lockfile is stale (`@lovable.dev/cloud-auth-js@0.0.3` vs current `1.1.1`, and `tsx` is missing). Lovable uses Bun. Removing `package-lock.json` avoids future tooling confusion
6. **JSON-LD coverage gaps** worth adding for GEO:
   - `BreadcrumbList` on category pages and blog posts (helps Google + AI search)
   - `Product` or `SoftwareApplication` on Pricing
   - `Article` on Blog posts (currently has BlogPosting fields — verify schema completeness)
7. **OG image per page** — most pages share the default social image. SEO landing pages and BlogPost should pass a more specific `ogImage` for richer social previews

## Proposed implementation plan

**Phase 4a — cleanup (low risk, high signal)**
- Delete stale `package-lock.json`
- Remove obsolete prerender comment block in `index.html`
- Audit every route in `App.tsx`; add `<SEOHead canonical=...>` to any public page missing it
- Update `.lovable/plan.md` to reflect current state

**Phase 4b — adopt `react-helmet-async` (Lovable-recommended)**
- Add dependency, wrap `App.tsx` in `<HelmetProvider>`
- Refactor `SEOHead.tsx` to use `<Helmet>` (same props API — no caller changes)
- Refactor `JsonLd.tsx` to render `<script type="application/ld+json">` inside Helmet
- Verify with View Source on a few routes

**Phase 4c — schema enrichments (optional, do after 4b)**
- Add `BreadcrumbList` JSON-LD helper, apply to `/seo/*`, `/features/*`, `/blog/:slug`
- Verify BlogPost Article schema completeness
- Per-page `ogImage` on top-converting routes (Home, Pricing, How it works, Why VOVV, top SEO landings)

I'll execute this in two messages: 4a + 4b together (they're tightly related and make Lovable's recommendation real), then 4c if you want the schema enrichments.

Approve and I'll start with 4a + 4b.