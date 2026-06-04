## Goal

Ship `/ai-product-photography/socks` — a dedicated SEO category landing page styled after the existing sub-niche pages (`phone-cases`, `caps-hats`, `wedding-dresses`). No videos/feed assets yet; we'll wire those in later when you send them.

## What I'll do

1. **Add a new entry to `src/data/aiProductPhotographyCategoryPages.ts`** (appended after the phone-cases block).
   - `slug: 'socks'`, `url: /ai-product-photography/socks`, `groupName: 'Socks'`.
   - SEO title + meta description targeting "AI sock photography", "sock product photography", "sock lifestyle photos", "sock flatlays".
   - Hero copy, eyebrow ("Editorial · Lifestyle · Detail"), primary + secondary + long-tail keywords.
   - `subcategories`: Crew, Ankle, Knee-high, No-show, Athletic, Dress.
   - 4 pain points tuned to sock brands (color drops, on-leg photography cost, fabric/knit detail, lifestyle aesthetic per pattern).
   - 8 `visualOutputs` (editorial leg, on-body detail, studio packshots, flatlays, sneaker/athletic, café/lifestyle, campaign hero, ad creatives).
   - ~16 `sceneExamples` pulled from the live socks collection (using the existing scene-preview image IDs already in the DB so previews work immediately — e.g. `1780561729765-k0cxep`, `1780561753998-8v4ch1`, `1780561781148-bydrlo`, `1780561735998-4y8go4`, `1780561743164-35a6ov`, `1780561809148-uezs3k`, `1780561814214-1h7t2a`, `1780561758765-d31zv2`, `1780561722965-qmbl7f`, `1780561788931-yt6gea`, `1780561775831-bdl9dx`, `1780561799181-sbj36y`, `1780561804798-xep5qv`, `1780561765448-svp02c`, `1780561771148-hdijht`, `1780561748398-cyhaci`).
   - 6 `useCases` (Shopify PDPs, lifestyle drops, Pinterest/IG, lookbooks, Meta/TikTok ads, email banners).
   - 5 sock-specific `faqs` (preserve knit/pattern, on-leg without a model shoot, Shopify, IG feeds, color variants).
   - `relatedCategories`: `['fashion', 'activewear', 'hoodies', 'footwear']`.
   - `heroImageId: '1780561729765-k0cxep'`, `heroNoun: 'sock'`.
   - `heroCollage` of 4 stills for now: Editorial, Lifestyle, Detail, Flatlay (no `videoSrc` yet — you'll provide motion later, same as phone-cases got `phone-cases-motion-1`).

2. **No other code changes required** — the dynamic route `src/pages/seo/AIProductPhotographyCategory.tsx` already renders any slug present in this data file. The deep-link from category → visual library (`src/lib/visualLibraryDeepLink.ts`) already has `socks → fashion/socks`.

3. **Sitemap** regenerates from this data source, so socks gets picked up automatically on the next sitemap build.

## What's NOT in this pass (you said you'd send later)

- Hero collage video (`videoSrc`) and the `socks-motion-*` asset JSONs in `src/assets/seo/`.
- A dedicated `socks-feed.jpg` asset for the feed strip (page still renders without it; it falls back to image-only outputs like wedding-dresses currently does).
- Adding socks to the top-level `/ai-product-photography` index grid (`src/data/aiProductPhotographyCategories.ts`) — phone-cases and caps-hats are also sub-niche-only, so I'll keep socks consistent unless you want it surfaced there.

## Files

- edit: `src/data/aiProductPhotographyCategoryPages.ts` (append one ~85-line entry)
