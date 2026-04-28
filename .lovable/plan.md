## Phase 5: Complete Lovable's SEO checklist

Phases 4a + 4b handled the foundation (sitemap, robots, canonicals, helmet). This phase fills in the remaining gaps from Lovable's official SEO/GEO guide — focused on what actually moves rankings and rich results in Google.

---

## What we're adding (in order of impact)

### Step 1 — BreadcrumbList JSON-LD on category & blog pages (highest ROI)
When Google sees breadcrumb schema, it replaces the raw URL in search results with a clean breadcrumb trail (e.g. *Home › AI Product Photography › Fashion*). Higher CTR with minimal effort.

Add to:
- All 10 `/ai-product-photography/:category` pages → Home › AI Product Photography › [Category]
- All 8 `/blog/:slug` pages → Home › Blog › [Post title]
- All 10 `/features/*` pages → Home › Features › [Feature]
- The 4 comparison pages (`/etsy-product-photography-ai`, `/shopify-product-photography-ai`, `/ai-product-photography-vs-photoshoot`, `/ai-product-photography-vs-studio`)

Implementation: a tiny helper `src/lib/seo/breadcrumbs.ts` that builds the schema, used via the existing `<JsonLd>` component. No new dependencies.

### Step 2 — Audit & fix per-page JSON-LD coverage
Go through all 22 pages that currently use `<JsonLd>` and verify they emit the right schema type. Fix anything mismatched, specifically:
- Blog posts → `BlogPosting` (with `headline`, `datePublished`, `author`, `image`)
- Blog index → `Blog`
- FAQ pages → `FAQPage` with question/answer pairs
- Pricing → keep current
- Home → keep current

Then add basic `WebPage` + `description` schema to the ~12 pages that have none today (about, careers, contact, team, press, help, status, changelog, roadmap, cookies, privacy, terms).

### Step 3 — H1 & internal linking audit
Lovable's checklist says: **one H1 per page** containing the primary keyword, and `<a>` tags (not `onClick`) for internal navigation.

I'll run a scan across all 55 public pages and list any violations:
- Pages with zero H1s
- Pages with multiple H1s
- Internal navigation buttons that should be `<a>` / `<Link>` tags

Then fix anything found. Most pages are likely fine — this is a quality pass.

### Step 4 — Verification & docs
After deploying:
- Run Lovable's three browser console checks from the docs (canonical, title length, H1 count) on 5 sample pages
- Provide you with the exact URLs to:
  1. Submit `https://vovv.ai/sitemap.xml` to Google Search Console
  2. Test 3 key pages (homepage, a category page, a blog post) in Google's Rich Results Test
- Document what to expect

---

## What I'm NOT doing in this phase (and why)

- **Per-page Open Graph images** — would require designing/generating ~50 unique social preview images. Big design project, separate decision.
- **Server-side rendering / true link previews on LinkedIn/Slack/X** — Lovable doesn't offer SSR for SPAs. The honest fix needs a different hosting setup. Worth a separate conversation if social previews matter to you.
- **Content/keyword optimization** — that's a copywriting task, not a code task. I can flag obvious gaps if you want, but won't rewrite copy without your input.
- **Submitting to Google Search Console** — requires your account, you'd do this manually (I'll give you exact steps).

---

## Estimated impact

| Change | Likely SEO impact |
|---|---|
| Breadcrumb schema | Medium-high — visible in Google results within ~2 weeks of crawl |
| BlogPosting / FAQPage schema | Medium — eligible for rich results |
| H1 / `<a>` tag fixes | Low-medium — long-term ranking hygiene |
| Verification | Catches issues before they cost you traffic |

---

Approve and I'll work through Steps 1–4 in one pass. Step 3 may surface fixes I can't predict in advance — I'll flag anything significant before changing it.