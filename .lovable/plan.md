## What's actually happening

Your overrides **are** saving correctly and the code that reads them on the live SEO pages **is** correct. I traced it end-to-end:

1. Admin saves → row lands in `seo_page_visuals` table (verified: 20+ rows in DB, including your recent edits to `/ai-product-photography`).
2. The public anonymous API can read those rows (RLS policy `Anyone can read seo visual overrides` is open).
3. Components like `PhotographyHero`, `PhotographyVisualSystem`, `LandingHeroSEO`, etc. all import `useSeoVisualOverridesMap` and call `resolveSlotImageUrl(...)` with the correct `pageRoute`.

So why don't you see the changes on `vovv.ai`?

## The real cause: stale production bundle

I fetched the JS bundle currently served at `https://vovv.ai/ai-product-photography` (`assets/index-CJJ91ZPN.js`) and searched it for override-related code:

- `seo-page-visuals` → only appears once, as the admin **route registration**.
- `seo_page_visuals` (the DB table name used in the public components) → **0 hits**.
- `seo-visual-overrides` (the localStorage key / query key) → **0 hits**.

Translation: the published build at `vovv.ai` was deployed **before** the SEO override system shipped. The admin UI is included (it's a separate route), but the public SEO pages on production are still running their old hardcoded fallback images. Editing in admin can never affect them — the code that reads the overrides isn't in that bundle.

The preview build (`id-preview--…lovable.app`) has the new code, which is why it works there but breaks on the live domain.

## What needs to happen

There is **no code change needed**. The system is already correct. You just need to publish a new build so the production bundle includes the override-reading code.

### Steps

1. Click **Publish → Update** in the Lovable editor (top-right). This rebuilds and deploys the latest code to `vovv.ai`, `www.vovv.ai`, and `vovvai.lovable.app`.
2. After publish completes, hard-refresh the live page once (⌘/Ctrl-Shift-R) to drop any cached JS chunks.
3. From that point on, every admin save will appear on the live page on the next visit (and immediately for the admin themselves, thanks to the localStorage snapshot invalidation we shipped last round).

### How to verify it worked

After republishing, run this in any terminal — it should return a number greater than 0:

```
curl -s https://vovv.ai/$(curl -s https://vovv.ai/ai-product-photography \
  | grep -oE 'assets/index-[A-Za-z0-9]+\.js' | head -1) \
  | grep -c "seo_page_visuals"
```

If it prints `0`, the publish hasn't propagated yet. If it prints `1` or more, the override system is now live in production.

### Note on the preview environment

In the Lovable preview (`id-preview--…lovable.app`) the overrides already work — that's the build with the new code. So if you want to QA admin changes before publishing, do it in preview, then publish to push it to `vovv.ai`.
