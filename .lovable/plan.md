

## New Blog Post: "AI-Generated Product Photography Examples: 12 Stunning Use Cases"

### What
Add a new SEO-focused blog post showcasing 12 featured Discover images across multiple categories (fashion, beauty, fragrances, jewelry, sports, lifestyle). Each image links back to the Discover feed, driving organic traffic into the app.

### Why
- Rich, real image content improves crawlability and image search rankings
- Internal links to `/discover`, `/freestyle`, and feature pages boost site authority
- Showcases real platform output as social proof

### File changes

**`src/data/blogPosts.ts`**
- Add a new blog post entry to the `blogPosts` array with slug `ai-product-photography-examples-gallery`
- No cover image import needed — the cover will be one of the Discover image URLs directly
- Markdown content will embed ~10 featured Discover images using standard `![alt](url)` syntax with descriptive alt text for SEO
- Content structured around category sections: Fashion & Apparel, Beauty & Skincare, Fragrances & Luxury, Jewelry & Accessories, Sports & Lifestyle
- Each section includes 2-3 images with context about how they were generated
- Internal links to `/features/virtual-try-on`, `/features/brand-profiles`, `/freestyle`, `/discover`
- SEO tags targeting: "AI product photography examples", "AI fashion photography", "AI generated product images"

**`public/sitemap.xml`**
- Add entry for `/blog/ai-product-photography-examples-gallery`

### Blog post outline

```text
Title: "12 AI-Generated Product Photography Examples That Look 100% Real"
Slug: ai-product-photography-examples-gallery

Sections:
1. Intro — AI photography has crossed the uncanny valley
2. Fashion & Apparel (Studio Chair Pose, The Gaze of Blue, Blue & White Sporty Chic)
3. Beauty & Skincare (Nature's Essence Shampoo, Radiant Natural Beauty)
4. Fragrances & Luxury (BYREDO Gypsy Water on Ice, Aquatic Reflection)
5. Jewelry & Accessories (Diamond Hoop Earrings, Sunkissed Glamour)
6. Sports & Lifestyle (Sitting Pretty on the Rim, Stadium Chic)
7. How these images were made (link to Freestyle + Discover)
8. FAQ (Can I recreate these? Are they royalty-free? etc.)
```

### Image sources
All images are existing Supabase storage URLs from the featured `discover_presets` — no new assets needed. They'll be embedded as standard markdown images with SEO-optimized alt text.

