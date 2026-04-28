# SEO polish — canonical & SearchAction alignment

Two small consistency fixes from the audit. No risk, no scope beyond `index.html`.

## Changes

**1. Canonical trailing slash (line 11)**

From:
```html
<link rel="canonical" href="https://vovv.ai/" />
```
To:
```html
<link rel="canonical" href="https://vovv.ai" />
```
Matches the `SITE_URL` constant used by every `SEOHead` instance sitewide, eliminating canonical mismatch between the static head tag and React-rendered per-page canonicals.

**2. WebSite SearchAction target (line 100, JSON-LD)**

From:
```
"target": "https://vovv.ai/product-visual-library?q={search_term_string}",
```
To:
```
"target": "https://vovv.ai/discover?q={search_term_string}",
```
Aligns sitewide JSON-LD with `Home.tsx`'s WebSite JSON-LD and reflects where search actually lives (`/discover`).

## Files touched
- `index.html` — 2 line edits

## Out of scope
Sitemap, robots.txt, per-page canonicals, route changes — all verified clean in the prior audit.
