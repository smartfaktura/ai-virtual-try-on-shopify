# Why publishing is failing

Your `package.json` build script is:

```
tsx scripts/generate-sitemap.ts && vite build && tsx scripts/prerender.ts && tsx scripts/validate-prerender.ts
```

The last two steps are the blockers:

1. **`scripts/prerender.ts`** spins up **Puppeteer / headless Chromium**, starts a local HTTP server on port 4321, and tries to render every URL from the sitemap (~417 routes) into static HTML.
2. **`scripts/validate-prerender.ts`** then walks `dist/` and **exits non-zero** if any route is missing a prerendered file or fails its SEO checks — which **fails the deploy**.

Lovable's deploy environment is a CSR-only build pipeline. It does **not** have Chromium available, can't open a local port reliably, and prerendering 400+ routes would time out the deploy even if it did. This is exactly the dead-end we discussed in the SEO plan: prerendering is incompatible with Lovable hosting.

The build was passing locally only because Puppeteer is installed in your dev sandbox. On the publish pipeline either Puppeteer fails to launch or `validate-prerender` rejects the empty/partial output → publish blocked.

# The fix

Drop prerender + validate-prerender from the build chain. They serve no purpose on Lovable hosting (the sibling `.html` files we tried to write last week are never matched by the host — that's the whole reason we pivoted to the sitemap/JSON-LD strategy in Phase 3).

## Changes

**`package.json`** — simplify scripts:

```text
"build":     "tsx scripts/generate-sitemap.ts && vite build"
"build:dev": "tsx scripts/generate-sitemap.ts && vite build --mode development"
```

Remove the now-unused npm scripts:
- `"prerender"`
- `"validate-prerender"`

Remove the dependency:
- `"puppeteer": "^24.42.0"` (saves ~170 MB of install time on every deploy)

**Files to delete (no longer referenced):**
- `scripts/prerender.ts`
- `scripts/validate-prerender.ts`

Keep `scripts/generate-sitemap.ts` — it's the Phase 3 work and still runs at build time.

## What we keep working

- ✅ Sitemap auto-regenerated on every build (417 URLs, image entries, real `lastmod`)
- ✅ `public/llms.txt`, `robots.txt`, `JsonLd.tsx`, `SEOHead.tsx` — all unchanged
- ✅ Google's two-stage CSR rendering picks up per-page titles/meta/JSON-LD via React Helmet
- ✅ Build is back to ~30s instead of timing out on Puppeteer

## What we lose

- Static `.html` files in `dist/` for clean URLs — but Lovable hosting wasn't serving these anyway, so no real loss.

## After publish

Re-run the curl canonical check on `/pricing`. Since the homepage `index.html` is the only HTML the host serves, the canonical there will still say `https://vovv.ai/`. That's expected and matches Lovable's official SEO/GEO guidance — Google's renderer will see the per-page canonical from `SEOHead.tsx` after JS hydration.

If Search Console later shows canonical confusion for non-Google bots, we can ship the runtime route-aware canonical patch we previously parked (it's a 10-line change in `index.html`'s inline script — no build implications).

Approve and I'll make the edits and you can republish.
