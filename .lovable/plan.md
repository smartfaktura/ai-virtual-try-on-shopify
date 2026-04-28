# Pre-render public SEO pages — final plan

Implements static HTML pre-rendering for the 55 public/SEO routes only. Multi-layer safeguards ensure `/app/*`, auth, admin, and token routes can never be prerendered.

---

## 1. Hard exclusions (defense in depth)

**Layer A — Source list**: URLs come from `dist/sitemap.xml`, generated from `MARKETING_URLS` + `blogPosts.ts` + `aiProductPhotographyCategoryPages.ts`. None of those sources contain private routes.

**Layer B — Hard regex blocklist** in `scripts/prerender.ts`. Any URL matching ANY pattern is refused, even if present in sitemap:

```ts
const FORBIDDEN_PATTERNS = [
  /^\/app(\/|$)/,
  /^\/auth(\/|$)/,
  /^\/onboarding(\/|$)/,
  /^\/reset-password(\/|$)/,
  /^\/upload(\/|$)/,
  /^\/tryshot(\/|$)/,
  /^\/admin(\/|$)/,
  /^\/payment-success(\/|$)/,
  /^\/settings(\/|$)/,
  /[0-9a-f]{8}-[0-9a-f]{4}/i,  // UUID-shaped tokens (e.g. /upload/<uuid>)
];
```

**Layer C — Runtime redirect detection**: After Puppeteer loads each page, compare requested vs. final URL with **trailing-slash tolerance**:
- ✅ `/pricing` → `/pricing/` allowed (same page)
- ❌ `/pricing` → `/auth?next=...` rejected (auth redirect)
- ❌ `/discover` → `/app/discover` rejected (route change)

**Layer D — HTML scan**: Final HTML scanned for `<input type="password">` → reject if found (auth-form leak guard).

---

## 2. Blog handling

**Only blog slugs in `sitemap.xml` are prerendered.** The sitemap script reads `blogPosts.ts` (canonical source). Therefore:

- ✅ Prerendered: 7 current blog slugs
- ❌ Not prerendered: any future `/blog/<unknown-slug>` — falls back to SPA, returns React 404, no static HTML created
- ❌ Not prerendered: dynamic `/blog/:slug` route param itself

Adding a new post = add to `blogPosts.ts` → next build auto-includes it. Zero manual list to maintain.

---

## 3. Public dynamic pages — content + privacy audit

| Route | Data source | Privacy verified | Prerender fallback |
|---|---|---|---|
| `/discover` | `discover_items` table, `published=true` only | Public RLS | Hero + headline + category nav + grid render before live data |
| `/freestyle` | `freestyle_public` view (curated only) | View exposes only public items | Hero + tabs + items |
| `/product-visual-library` | Static curated library | No user data | Full grid from static data |

All three have meaningful body content >500 chars before any live fetch resolves.

---

## 4. Validator rules

`scripts/validate-prerender.ts` runs after prerender. **Any failure exits non-zero → blocks deploy.**

### Universal checks (every page)

| Check | Rule |
|---|---|
| `<title>` | non-empty |
| `<title>` route-specific | NOT equal to default homepage title (unless route IS `/`) |
| `<meta description>` | non-empty |
| `<meta description>` route-specific | NOT equal to default homepage desc (unless route IS `/`) |
| Canonical | `<link rel="canonical">` present and matches the route |
| H1 | At least one `<h1>` in body |
| OG tags | `og:title`, `og:description`, `og:image`, `og:type` |
| Twitter tags | `twitter:card`, `twitter:title`, `twitter:image` |
| Body text | Visible text > 500 chars (excludes script/style) |
| Not loading-only | Body NOT just `Loading...` / brand spinner |
| No password input | No `<input type="password">` anywhere |

### JSON-LD policy

```ts
const JSONLD_REQUIRED = (path) =>
  path === '/' ||
  path === '/pricing' ||
  path === '/blog' ||
  path.startsWith('/blog/') ||
  path.startsWith('/ai-product-photography') ||  // main + categories
  path.startsWith('/features/');

const JSONLD_OPTIONAL_OK = [
  '/contact', '/status', '/privacy', '/terms', '/cookies',
  '/changelog', '/help', '/press', '/team', '/careers',
  '/about', '/roadmap', '/faq',
];
```

- Required + missing → fail
- Optional + missing → warn, continue
- Bonus checks: `/faq` and `/` must include `FAQPage`; blog posts must include `BlogPosting`; SEO landing pages must include `SoftwareApplication` or `Product`

---

## 5. Files

### New
- **`scripts/prerender.ts`** — Puppeteer + 4 safeguard layers + concurrency=4 + local static server on port 4321
- **`scripts/validate-prerender.ts`** — All checks above

### Modified
- **`package.json`** — Adds `puppeteer` to `devDependencies` and chains:
  ```
  build: tsx scripts/generate-sitemap.ts
       && vite build
       && tsx scripts/prerender.ts
       && tsx scripts/validate-prerender.ts
  ```

### Untouched (zero risk to existing app)
- All React source code (`src/**`)
- `src/App.tsx` routes
- Backend / Supabase / edge functions
- `robots.txt`, sitemap source data files
- `.env`, Supabase client/types

---

## 6. Build flow

```
1. generate-sitemap.ts  → public/sitemap.xml (55 URLs)
2. vite build           → dist/ (SPA bundle + sitemap.xml)
3. prerender.ts:
   a. Read dist/sitemap.xml
   b. Filter via FORBIDDEN_PATTERNS (defense in depth)
   c. Start static server on :4321 serving dist/
   d. Launch headless Chromium
   e. For each safe URL (concurrency=4):
      - page.goto(url, { waitUntil: 'networkidle0', timeout: 45s })
      - Wait 800ms for React/SEOHead to flush
      - Verify no auth redirect (trailing-slash tolerance)
      - Verify no <input type=password>
      - Capture full rendered HTML
      - Write dist/<route>/index.html
4. validate-prerender.ts:
   - Walk every dist/**/index.html created in step 3
   - Run universal checks + JSON-LD policy
   - Exit 1 on any failure
```

Lovable hosting auto-serves `dist/<route>/index.html` for matching paths (per built-in SPA fallback rules), so prerendered files take precedence over the SPA shell — without any hosting config changes.

---

## 7. Post-deploy verification (after you click Update)

I'll `curl` 6 live URLs and report **before vs after**:

| URL | Type |
|---|---|
| `/` | Homepage |
| `/pricing` | Top converter |
| `/ai-product-photography` | SEO main |
| `/ai-product-photography/fragrance` | SEO category |
| `/blog/ai-product-photography-for-ecommerce` | Blog post |
| `/discover` | Public dynamic |

For each: HTTP status, `<title>`, `<meta description>`, canonical, first H1, body text length, JSON-LD types found.

---

## 8. Build time impact

| Phase | Time |
|---|---|
| Before | ~30s |
| After | ~75–90s (puppeteer concurrency=4 over 55 pages) |

One-time cost per deploy. Zero runtime cost.

---

## 9. Rollback

Single-line revert in `package.json`:
```
"build": "tsx scripts/generate-sitemap.ts && vite build"
```
Next deploy reverts to current SPA behavior. Zero source code changes to unwind.

---

## 10. What stays SPA (untouched)

- All `/app/*` (authenticated app)
- `/auth`, `/onboarding`, `/reset-password`
- `/upload/:sessionToken`, `/tryshot/:domain`
- `/discover/:itemId`, `/freestyle/:itemId` (item details, not in sitemap)
- Future blog slugs not yet in `blogPosts.ts`

---

**Approve to implement.**
