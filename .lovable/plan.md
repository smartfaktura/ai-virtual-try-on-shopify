## Fix: Severity 0 — Prerendered HTML not served on clean URLs

### What's broken
Every public page on `vovv.ai` returns the homepage HTML shell instead of its prerendered content. Confirmed: `curl https://vovv.ai/pricing` returns the homepage title and `<link rel="canonical" href="https://vovv.ai">`, but `curl https://vovv.ai/pricing/index.html` returns the correct prerendered Pricing page. Lovable hosting is not auto-serving `<route>/index.html` for clean URLs — it falls back to the root SPA shell.

Result: every blog post, category page, and feature page declares the homepage as canonical, so Google deduplicates them all into `/`. Nothing beyond the homepage can rank.

### The fix (3 surgical edits)

**1. `scripts/prerender.ts` — write a sibling `<route>.html` file as well**

Currently writes only `dist/<route>/index.html`. Change to write **both**:
- `dist/<route>/index.html` (kept as fallback)
- `dist/<route>.html` (the critical one — most static hosts/CDNs match this directly for `GET /<route>`)

So `/pricing` → `dist/pricing.html`, `/blog/foo` → `dist/blog/foo.html` and `dist/blog/foo/index.html`. The root stays at `dist/index.html`.

**2. `index.html` — remove the hardcoded root canonical**

Currently `<link rel="canonical" href="https://vovv.ai" />` is baked into the static template. This wins against any per-page canonical for non-JS bots and for any moment before React hydrates. Remove it; per-page canonicals are already written into prerendered HTML by `SEOHead`. Leave a comment explaining why it's intentionally absent.

**3. `index.html` — fix viewport accessibility**

`maximum-scale=1.0, user-scalable=no` violates WCAG 1.4.4 and is a known negative SEO/UX signal. Drop both — keep only `width=device-width, initial-scale=1.0`.

### Verification after deploy

After clicking Update / Publish, I'll re-run:
```
curl -sL https://vovv.ai/pricing | grep -E "<title>|canonical"
curl -sL https://vovv.ai/blog/ai-product-photography-for-ecommerce | grep -E "<title>|canonical"
curl -sL https://vovv.ai/ai-product-photography/fashion | grep -E "<title>|canonical"
```
Each should return its own page-specific title and a canonical that matches the requested URL.

### If `<route>.html` also isn't served (fallback plan)

If verification still shows the homepage shell after deploy, the next step is a tiny edge-side rewrite **or** a runtime patch in `index.html` that injects a `<script>` reading `location.pathname` and rewriting `<title>` + canonical from a small route map before React mounts. I'll only do that if the file-naming change isn't enough.

### Out of scope (already plotted, separate PRs)
Discover items in sitemap, image sitemap, BreadcrumbList JSON-LD, per-page OG images, real `lastmod` dates, FAQ schema on pricing/comparison pages.

Approve to apply the three edits.
