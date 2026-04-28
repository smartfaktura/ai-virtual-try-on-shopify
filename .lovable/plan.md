# Phase 7a — Image sitemap for Google Images discovery

## Goal

Tell Google Images about every important visual on our public pages so they can appear in image search results. Right now our sitemap lists 55 page URLs with zero image annotations — Google only finds our images by chance during JS rendering.

## Scope

A static `sitemap-images.xml` covering the highest-value images:

1. **Category landing page heroes** — 14 entries (one per `/ai-product-photography/[category]` page, using `heroImageId` from `aiProductPhotographyCategoryPages.ts`).
2. **Category page featured scenes** — up to 8 representative scene previews per category (~80-100 entries).
3. **Blog post cover images** — one per published post in `blogPosts.ts` (~10-15 entries).
4. **Brand/marketing hero** — homepage hero, social card image (~3 entries).

Estimated total: **~110 image entries** across **~20 page URLs**.

## What we'll build

### 1. Generator script (`scripts/generate-image-sitemap.ts`)

A Node script that reads from existing data sources and emits XML. Run manually (like our current page sitemap workflow):

```text
src/data/aiProductPhotographyCategoryPages.ts  →  category hero + scenes
src/data/blogPosts.ts                          →  blog covers
src/lib/constants.ts (DEFAULT_OG_IMAGE)        →  homepage hero
                  ↓
            public/sitemap-images.xml
```

Each entry follows Google's image sitemap spec:
```xml
<url>
  <loc>https://vovv.ai/ai-product-photography/fashion</loc>
  <image:image>
    <image:loc>https://.../scene-preview.jpg</image:loc>
    <image:title>Editorial fashion product photography</image:title>
    <image:caption>AI-generated on-model fashion shot, studio lighting</image:caption>
  </image:image>
  ... (more image entries for the same page)
</url>
```

Captions are auto-built from the existing scene `name` + category `name` fields — no manual writing needed.

### 2. Sitemap index (`public/sitemap.xml`)

Convert our current single sitemap into an **index file** that points to two sub-sitemaps:

```xml
<sitemapindex>
  <sitemap><loc>https://vovv.ai/sitemap-pages.xml</loc></sitemap>
  <sitemap><loc>https://vovv.ai/sitemap-images.xml</loc></sitemap>
</sitemapindex>
```

- Current `sitemap.xml` content moves to `sitemap-pages.xml` (no content change, just renamed).
- This is Google's recommended pattern when splitting sitemaps; existing GSC submission keeps working.

### 3. `robots.txt` update

Already references `Sitemap: https://vovv.ai/sitemap.xml`. The index file pattern means we don't need to change robots.txt — Google follows the index automatically. But we'll add an explicit second `Sitemap:` line for `sitemap-images.xml` as a belt-and-suspenders signal (Bing handles this slightly differently).

## What we explicitly won't do in 7a

- **Dynamic edge function** — saved for Phase 7b if traffic warrants. Static is fine for v1.
- **Public discover/freestyle showcase library** — currently disallowed in robots.txt (`Disallow: /discover/` for item pages). Indexing those images would require allowing the URLs and confirming we have rights/labels for every showcase asset. Separate decision.
- **Filename rename pass** on existing assets — they're already descriptive enough (e.g. `hero-product-croptop.jpg`, not `IMG_4823.jpg`).
- **License URLs** in the image XML — we don't publish a public license page yet.

## Technical scope (for the dev side)

Files touched:
- `scripts/generate-image-sitemap.ts` — new generator
- `public/sitemap.xml` — converted to sitemap index
- `public/sitemap-pages.xml` — new (renamed from current sitemap.xml content)
- `public/sitemap-images.xml` — new
- `public/robots.txt` — add second Sitemap: line
- `.lovable/plan.md` — log Phase 7a

No dependencies, no backend, no runtime change. Pure static XML.

## After deploy (you do this — 5 min)

1. **Google Search Console** → Sitemaps → submit `https://vovv.ai/sitemap-images.xml` as a separate entry alongside the existing one.
2. Wait 2-4 weeks. Check **GSC → Indexing → Pages** and **Performance → Search type: Image** to see image impressions start appearing.

## Estimated impact

- **Google Images traffic** — currently near zero from organic image search; could become a meaningful long-tail channel for "ai fashion product photography", "fragrance product shot ai", etc.
- **GEO** — multimodal AI (Gemini, GPT-4o, Perplexity) increasingly cites images. Image sitemaps make ours easier to discover.
- **No risk** — no behavior change for users, no impact on existing page indexing.

Approve and I'll build the generator, run it, and wire up the index in one pass.
