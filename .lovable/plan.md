## 1. Fix pricing in the 3 new blog posts

Find every inflated "$180 / $640 / $700 / 'cost in AI credits'" framing in the swimwear, bags, and fashion posts in `src/data/blogPosts.ts` and replace with the real plan price: **"VOVV.AI plans start at $39/mo"**.

Specific edits per post:
- **Swimwear** (`ai-swimwear-photography-resort-campaigns`)
  - Excerpt: replace "shot the entire SS26 campaign for $180 in AI credits" → "shot the entire SS26 campaign on a VOVV.AI plan that starts at $39/mo".
  - Any in-body line referencing "$180 in AI credits" / per-image dollar math that conflicts → rewrite around "$39/mo plan, unlimited iterations within your monthly credits".
- **Bags** (`ai-bag-photography-product-pages`)
  - Same sweep: replace any "$X in credits" claim with "starts at $39/mo".
- **Fashion** (`ai-fashion-photography-ecommerce-brands`)
  - Excerpt: "$640 in AI credits" → "a VOVV.AI plan starting at $39/mo".
  - In-body cost tables / paragraphs: rewrite comparison rows so the AI column reads "From $39/mo" instead of arbitrary dollar totals.

Cost-comparison tables stay (they're the SEO hook), but the AI row in each table is normalized to "VOVV.AI from $39/mo" with a footnote-style sentence like "Higher tiers ($79, $179) add more monthly credits and seats".

## 2. Add more collage images inside each post

Extend the blog markdown renderer to support an inline collage block. Smallest, lowest-risk approach:

- In `src/pages/BlogPost.tsx` markdown image handler, detect when the `src` contains `|` (pipe-separated URLs, e.g. `![alt](url1|url2|url3)`). When detected, render a CSS grid (`grid-cols-2` or `grid-cols-3` depending on count, gap-1, rounded, same max width as current inline images) of `ShimmerImage` tiles instead of a single image.
- This keeps the markdown source readable and avoids adding a remark plugin.

Then add 2 new inline collages to each of the 3 posts using the scene-preview URLs already present in `src/data/aiProductPhotographyCategoryPages.ts` / the existing inline images in each post:

- **Swimwear** — one 3-up collage after the "scene system" section (resort villa / White Lotus glow / poolside), one 2-up collage near the closing CTA (Maldives + Aegean Deck).
- **Bags** — one 3-up collage after the "hardware closeup" section (sculptural studio / hardware / on-body), one 2-up collage in the PDP-set section (campaign wind + city carry).
- **Fashion** — one 3-up collage after the "studio look" section (sunlit tailoring / clean studio / chair editorial), one 2-up collage near the closing CTA (architectural exterior + luxury street walk).

No images change on the blog list cards (those already use the 3-image cover collage shipped previously).

## Files

- `src/data/blogPosts.ts` — pricing rewrites + new inline collage markdown lines in 3 posts.
- `src/pages/BlogPost.tsx` — extend the `img` markdown component to render pipe-separated `src` as a grid collage.
