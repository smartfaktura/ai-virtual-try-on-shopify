## SEO Polish: Tighten Titles & Meta Descriptions Across SEO Pages

### Audit Result
All 14 SEO landing pages have a strong foundation: unique titles, canonicals, OG/Twitter tags, H1s, sitemap entries, and JSON-LD (Breadcrumb + FAQPage + SoftwareApplication/Article/CollectionPage). Robots.txt allows all major search and AI crawlers and blocks private routes.

The only meaningful issue: **meta descriptions are 187–211 characters**, exceeding Google's ~160-char SERP display. They will be truncated mid-sentence, hurting click-through rate. A few **titles are 64–69 chars**, also borderline (Google truncates around 60 px-width).

### What I'll change

**1. Trim meta descriptions to ≤155 characters** for these 14 pages:
- `src/pages/seo/ShopifyProductPhotography.tsx`
- `src/pages/seo/EtsyProductPhotography.tsx`
- `src/pages/seo/AIPhotographyVsPhotoshoot.tsx`
- `src/pages/seo/AIPhotographyVsStudio.tsx`
- `src/data/aiProductPhotographyCategoryPages.ts` — all 10 categories (fashion, footwear, beauty-skincare, fragrance, jewelry, bags-accessories, home-furniture, food-beverage, supplements-wellness, electronics-gadgets)

Each rewritten description will:
- Lead with the primary keyword (e.g., "AI fashion product photography")
- Include the value prop ("from one product photo")
- End with the use-case payoff ("for ecommerce listings, ads, and campaigns")
- Stay under 155 chars

**2. Shorten titles ≥60 chars** to ~55–58:
- Electronics: "AI Electronics Product Photography for Tech & Gadget Brands | VOVV.AI" (69) → "AI Electronics Product Photography for Tech Brands | VOVV.AI" (60)
- Bags & Accessories: "AI Bag Product Photography for Bags & Accessories Brands | VOVV.AI" (66) → "AI Bag & Accessory Product Photography | VOVV.AI" (49)
- Home & Furniture: "AI Home Decor Product Photography for Furniture Brands | VOVV.AI" (64) → "AI Home & Furniture Product Photography | VOVV.AI" (49)
- Food & Beverage: "AI Food Product Photography for Food & Beverage Brands | VOVV.AI" (64) → "AI Food & Beverage Product Photography | VOVV.AI" (48)
- Supplements: "AI Supplement Product Photography for Wellness Brands | VOVV.AI" (63) → "AI Supplement & Wellness Product Photography | VOVV.AI" (54)
- Fragrance: "AI Perfume Product Photography for Fragrance Brands | VOVV.AI" (61) → "AI Perfume & Fragrance Product Photography | VOVV.AI" (52)
- Fashion: "AI Fashion Product Photography for Clothing Brands | VOVV.AI" (60) → keep (within budget)

**3. No structural changes.** Schemas, canonicals, sitemap, robots, H1s, internal links, and OG images already follow best practice and stay as-is.

### Out of scope (already good)
- Sitemap (all 14 pages indexed with sensible priorities)
- Internal linking (footer + cross-references between Shopify/Etsy/categories)
- Structured data (3 schema types per page)
- Hero images (LCP-preloaded on category pages)
- Mobile responsiveness and Core Web Vitals
