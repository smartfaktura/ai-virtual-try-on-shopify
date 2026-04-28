## SEO plan — aligned with Lovable's official SEO/GEO playbook

### What Lovable officially says (https://docs.lovable.dev/tips-tricks/seo-geo)

Direct quotes / paraphrase from the doc:

- Lovable apps are **CSR SPAs**. There is no SSR, no static export, and no hosting-layer rewrite system (no `_redirects`, no `vercel.json`).
- "**Google can index CSR sites**" via two-stage rendering. "Indexing can take a bit longer (days instead of hours)... It **does not harm rankings**, only indexing speed."
- Social platforms (FB, X, LinkedIn) and many AI crawlers **don't render JS** — so for them, what matters is what's in the **initial HTML shell**.
- The official recommendations are: sitemap.xml, robots.txt, **canonical tags per page**, clean URLs, semantic HTML, per-page `<title>` + meta description, JSON-LD, OG/Twitter tags, image alt + dimensions, internal linking, GSC verification.

**There is no official prerender / dist/<route>.html guidance.** The current `scripts/prerender.ts` + sibling-file scheme is a custom hack that we have already proven the Lovable hosting layer does not honor (it never auto-matches `/pricing` → `/pricing.html` and never will, per Lovable docs and our curl tests).

### What this means for our 500K traffic goal

Google itself isn't the blocker — Googlebot will render our pages and read the per-route `<title>`, canonical, and JSON-LD that `SEOHead` writes via React Helmet on mount. The pages just take a few extra days to land in the index.

The real gaps are:
1. **Social/non-JS bot previews are wrong** — every shared link shows the homepage OG.
2. **Sitemap missing ~400 `/discover/<slug>`** items, no image sitemap, `lastmod` is build date instead of `updated_at`.
3. **No BreadcrumbList / FAQ / Article JSON-LD** on the pages that should have them.
4. **Duplicate-canonical risk**: `vovv.ai` vs `www.vovv.ai` vs `vovvai.lovable.app` — need one primary + 301s.
5. **Several pages still missing per-route OG image** (only generic VOVV.AI social card).

The prerender pipeline solves (1) for Google but **not for non-JS bots**, and Lovable hosting won't serve it on clean URLs anyway. So we drop it as the canonical fix and instead do what Lovable officially recommends.

### Plan — 5 phases, all in line with Lovable docs

---

#### Phase 1 — Stop fighting the hosting layer (cleanup)

- **Remove** the `dist/<route>.html` sibling-file write from `scripts/prerender.ts`. Keep only `dist/<route>/index.html` as a *fallback for crawlers that probe directory URLs* (no harm if it's never served).
- **Remove** the runtime-hydration script idea entirely. It would have introduced sync-XHR + `document.write`, which Google Page Experience flags negatively.
- **Keep** `index.html` as-is (canonical removed, viewport fixed — both already shipped).
- **Trust React Helmet / `SEOHead.tsx`** to set per-route `<title>`, canonical, OG, JSON-LD on mount. This is exactly Lovable's recommended pattern.

Rationale: Lovable docs explicitly say CSR + JS rendering "does not harm rankings, only indexing speed." We're spending a lot of complexity to shave days off indexing — not worth it. Better to invest that effort in things that actually move rankings.

---

#### Phase 2 — Fix what non-JS bots see (the only thing the SPA shell can't fix at runtime)

Since social/AI crawlers don't run JS, the **initial HTML shell** must carry generic-but-correct fallbacks. Today it does, except:

- ✅ `<title>`, description, OG image, Organization + WebSite JSON-LD already in `index.html`.
- ❌ Per-page OG previews when a blog post / pricing page / category page is shared — they all show the homepage card.

**The only clean way to fix this on Lovable** is one of:

- **Option A (recommended): Edge function OG image responder.** Add a Supabase edge function `og-image` that takes a route slug and returns a generated PNG (cached). Then in `SEOHead.tsx`, set `og:image` to `https://…/functions/v1/og-image?path=/blog/foo`. ✅ Works for both rendered and non-rendered crawlers because the **value of `og:image`** is what matters — but the OG **tag itself** is set via JS. So this only helps Google/crawlers that render JS. **For Facebook/X/LinkedIn that don't render JS, the OG tag must be in the static shell.** We can't do that per-page without prerender that hosting actually serves.

- **Option B (realistic): Accept that social previews show the homepage card** and instead make the homepage OG card **generic but excellent** (already done). For high-value share links (blog posts, pricing), provide a **share-helper utility** that uses canonical + UTM and lets us add per-post OG via a query-string redirect through an edge function that returns custom HTML with the right OG tags for that single URL. Use sparingly for marketing pushes.

We'll go with **Option B** unless the user wants to invest in Option A. This matches Lovable's doc which simply notes the social-preview limitation and moves on.

---

#### Phase 3 — Sitemap & robots hardening (Lovable-recommended, biggest indexing win)

Per Lovable's "Foundation: Make your site crawlable" section.

1. **`scripts/generate-sitemap.ts`**
   - Pull all `/discover/<slug>` from the `public_discover` table at build time → ~400 new URLs.
   - Pull all `/blog/<slug>` from the blog source.
   - Pull all `/ai-product-photography/<category>` from `aiProductPhotographyCategories.ts`.
   - Use real `updated_at` for `<lastmod>` (fall back to build date only if missing).
   - Add **image sitemap entries** (`<image:image><image:loc>`) for blog posts and discover items — Lovable doc doesn't require this but it's a known multiplier for visual-heavy brands like ours.
   - Set sensible `<priority>` per Lovable example: home 1.0, pricing/main 0.8, blog/discover 0.6.
   - Split into multiple sitemaps if it exceeds 5K URLs (it won't yet) and reference them from a sitemap index.

2. **`public/robots.txt`**
   - Already allows all crawlers ✅
   - Add explicit `Allow:` for `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended` — per Lovable's GEO section ("Controls AI bot access (GPTBot, PerplexityBot) based on your strategy").
   - Confirm no CSS/JS/`/assets/` is blocked.
   - Reference sitemap at the bottom.

3. **Submit** sitemap to Google Search Console + Bing Webmaster Tools (one-time, user does this).

---

#### Phase 4 — On-page SEO hardening (per Lovable's "On-page SEO" section)

Audit all public pages and ensure each has:

- ✅ Unique `<title>` ≤ 60 chars including primary keyword + brand
- ✅ Unique meta description 140-160 chars
- ✅ Exactly one `<h1>` matching page intent
- ✅ Logical H1 → H2 → H3 (no skipped levels)
- ✅ `<main>`, `<nav>`, `<footer>`, `<section>` semantic tags
- ✅ Every `<img>` has descriptive `alt`, `width`, `height`, lazy loading
- ✅ Internal links use real `<a href>`, descriptive anchor text, 3-5 contextual links per content page
- ✅ Single canonical per page pointing to the canonical URL (no trailing slash, no www variant if vovv.ai is primary)

**Pages to audit (priority order):**
- `/pricing`, `/how-it-works`, `/why-vovv`, `/about`, `/templates`
- `/blog`, `/blog/<slug>` (all)
- `/ai-product-photography`, `/ai-product-photography/<category>` (all)
- `/discover`, `/discover/<slug>` (all)
- `/features/<feature>` (all)
- `/learn`, `/learn/<slug>` (all)

Tooling: write a one-shot QA script that crawls our own sitemap and reports per-URL gaps (missing title, dup canonical, missing H1, missing alt text, missing OG image). Output a CSV to `/mnt/documents/seo-audit.csv`.

---

#### Phase 5 — Rich results & GEO (per Lovable's "Rich results" + "GEO" sections)

1. **Structured data (JSON-LD)** — extend `JsonLd.tsx`:
   - `Organization` + `WebSite` ✅ already site-wide in `index.html`
   - `BreadcrumbList` on every non-home public page
   - `Article` on `/blog/<slug>` (headline, datePublished, dateModified, author, image)
   - `FAQPage` on `/pricing`, `/how-it-works`, comparison pages, FAQ page
   - `Product` / `CollectionPage` on `/templates`, `/discover` listings
   - `ItemList` on category pages

2. **GEO / LLM-friendliness** — Lovable's GEO section:
   - Make sure the **first 100 words** of every important page directly answer the page's promise (LLM-quotable patterns).
   - Maintain `/llms.txt` at site root listing key URLs + 1-line descriptions per Lovable's "Static LLM-friendly summary page" recommendation. We don't have this — add it.
   - Use semantic HTML (already covered in Phase 4).

3. **Domain consolidation** — confirm `vovv.ai` is set as primary in Lovable Domains panel, verify `www.vovv.ai` and `vovvai.lovable.app` 301 to it. Verify in GSC.

---

### Code changes summary

| File | Change |
|---|---|
| `scripts/prerender.ts` | Remove sibling `dist/<route>.html` write (keep dir/index.html only). Reduce concurrency / mark optional. |
| `index.html` | No change (already correct after last PR) |
| `scripts/generate-sitemap.ts` | Pull discover + blog + categories from DB/source; real `lastmod`; image sitemap entries |
| `public/robots.txt` | Add explicit AI bot allows; confirm sitemap reference |
| `public/llms.txt` | **New** — top URLs + 1-line descriptions for LLM crawlers |
| `src/components/SEOHead.tsx` | Already sets per-route `<title>` + canonical + OG via React Helmet ✅ — audit each page passes correct props |
| `src/components/JsonLd.tsx` | Add helpers: `<BreadcrumbJsonLd />`, `<ArticleJsonLd />`, `<FAQJsonLd />` |
| Per-page audit (`/blog/*`, `/pricing`, `/how-it-works`, `/discover/*`, `/ai-product-photography/*`, `/features/*`, `/learn/*`) | Add missing JSON-LD, fix titles/descriptions, add breadcrumbs |
| `scripts/seo-audit.ts` | **New** — crawl sitemap, report gaps to CSV |

### Verification per Lovable's doc

After deploy, run:
```
curl -sL https://vovv.ai/sitemap.xml | head        # validates sitemap
curl -sL https://vovv.ai/robots.txt                # validates AI bot allows
```
Then in browser console on each key page:
```js
console.log('Title:', document.title, document.title.length);
console.log('Desc:', document.querySelector('meta[name=description]')?.content);
console.log('Canonical:', document.querySelector('link[rel=canonical]')?.href);
console.log('H1s:', document.querySelectorAll('h1').length);
console.log('Missing alt:', document.querySelectorAll('img:not([alt])').length);
```
Then submit sitemap to GSC and watch indexing in Coverage report over 7-14 days.

### What we explicitly **drop** (vs previous plan)

- ❌ Sibling `dist/<route>.html` write — Lovable hosting won't serve it
- ❌ Runtime sync-XHR + `document.write` hydration — anti-pattern, breaks Page Experience
- ❌ Trying to fix non-JS social previews per-page — not solvable on Lovable hosting without prerender

### Sequencing recommendation

Approve and ship in this order so we get value fast:

1. **Phase 3 (sitemap + robots)** — biggest indexing win, low risk, ~1 hour
2. **Phase 4 (per-page audit)** — script + fixes for top 30 pages, ~2-3 hours
3. **Phase 5 (JSON-LD + llms.txt)** — visible rich results in 1-4 weeks, ~2 hours
4. **Phase 1 (cleanup)** — drop the prerender hack last so we have a known-good baseline first

Approve to proceed phase by phase? Or approve all four as one rollout?
