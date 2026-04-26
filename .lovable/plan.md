## SEO audit of /ai-product-photography/* category pages

Audited all 10 category pages against your 5 questions. Content lives in `src/data/aiProductPhotographyCategoryPages.ts` and renders through shared section components.

### Audit findings

**1. Keyword cluster targeting** — ✅ `primaryKeyword` and `secondaryKeywords` arrays match the intended clusters exactly. ⚠️ But the primary keyword does **not** appear in 9 of 10 H1s or SEO titles. Only Fashion uses "AI Fashion Product Photography" in its H1; the other 9 use the generic "AI Product Photography for [X] Brands" pattern. This is the biggest SEO miss.

**2. Category-specific content** — ✅ Strong. Pain points, FAQ answers, scene examples, visual outputs and use cases are genuinely personalized (fragrance talks about glass/reflections/gift sets, footwear about soles/stitching, supplements about labels/tubs/capsules, etc.). No template-stuffing.

**3. Uniqueness across pages** — ✅ Meta descriptions, hero subheads, FAQs, pain points and visual outputs are all differentiated. ⚠️ SEO titles share boilerplate "for [X] Brands | VOVV.AI" for 9 of 10 pages. Some meta descriptions also bury the primary keyword.

**4. Scene examples** — ✅ Each page already pulls real, category-matched scenes from the live catalog (footwear has "hard-shadow-shoes-sneakers", fragrance has "in-hand-lifestyle-fragrance", etc.). Match the brief.

**5. Internal linking** — ✅ `relatedCategories` arrays match your suggested mapping exactly. ⚠️ Anchor text on the related-category cards is the generic "Explore {groupName}" — should be descriptive like "Explore AI footwear product photography" for SEO.

### Fixes to apply

#### A. Rewrite 9 SEO titles + 9 H1s to lead with category-specific primary keyword

| Slug | New seoTitle | New H1Lead + Highlight |
|---|---|---|
| footwear | AI Footwear Product Photography for Shoe Brands \| VOVV.AI | "AI Footwear Product Photography" + "for Shoe Brands" |
| beauty-skincare | AI Skincare Product Photography for Beauty Brands \| VOVV.AI | "AI Skincare Product Photography" + "for Beauty & Skincare Brands" |
| fragrance | AI Perfume Product Photography for Fragrance Brands \| VOVV.AI | "AI Perfume Product Photography" + "for Perfume & Fragrance Brands" |
| jewelry | AI Jewelry Product Photography for Jewelry Brands \| VOVV.AI | "AI Jewelry Product Photography" + "for Jewelry Brands" |
| bags-accessories | AI Bag Product Photography for Bags & Accessories Brands \| VOVV.AI | "AI Bag Product Photography" + "for Bags & Accessories Brands" |
| home-furniture | AI Home Decor Product Photography for Furniture Brands \| VOVV.AI | "AI Home Decor Product Photography" + "for Home & Furniture Brands" |
| food-beverage | AI Food Product Photography for Food & Beverage Brands \| VOVV.AI | "AI Food Product Photography" + "for Food & Beverage Brands" |
| supplements-wellness | AI Supplement Product Photography for Wellness Brands \| VOVV.AI | "AI Supplement Product Photography" + "for Supplement & Wellness Brands" |
| electronics-gadgets | AI Electronics Product Photography for Tech & Gadget Brands \| VOVV.AI | "AI Electronics Product Photography" + "for Electronics & Gadget Brands" |

(Fashion already correct — leave as-is.)

#### B. Tighten 9 meta descriptions to lead with the primary keyword

Each rewritten meta description leads with the exact `primaryKeyword` and pulls the category-specific visual problems verbatim from your brief — fabric/silhouette for fashion, soles/stitching for footwear, glass/reflections for fragrance, ice/condensation for beverage, capsules/powders for supplements, etc. All within ~160 characters.

#### C. Improve related-categories anchor text

In `src/components/seo/photography/category/CategoryRelatedCategories.tsx`, change the card CTA text from generic `Explore {groupName}` to a descriptive phrase derived from each related category's `primaryKeyword`:

- "Explore AI footwear product photography"
- "Explore AI jewelry product photography"
- "Explore AI beauty & skincare product photography"
- etc.

This uses the primary keyword as natural anchor text — strong internal-link SEO signal — and varies across pages instead of repeating the same string everywhere.

### Files changed

- `src/data/aiProductPhotographyCategoryPages.ts` — 9 × (seoTitle + metaDescription + h1Lead + h1Highlight) rewrites
- `src/components/seo/photography/category/CategoryRelatedCategories.tsx` — descriptive anchor text on the 3 related-category cards
- `public/version.json` — bump

### Out of scope (already strong, no changes)

- Pain points, visual outputs, use cases, FAQs, hero subheads — all already category-specific
- Scene example IDs — already match real category-tagged scenes in the catalog
- `relatedCategories` arrays — already match your recommended mapping exactly
- Section H2s — already dynamically interpolated with `groupName`
- JSON-LD schemas — already personalized via `seoTitle` and `groupName`
