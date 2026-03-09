

## Generate Hero Images for All Blog Articles

Currently, blog articles have no images at all — just text. Adding a high-quality hero image to each article will dramatically improve engagement.

### Approach

Use the AI image generation model (`google/gemini-3-pro-image-preview` for highest quality) via an edge function to generate 6 photorealistic hero images — one per blog post. Upload each to the `landing-assets` storage bucket, then wire them into the blog data and layout.

### Images to Generate

| Blog Post | Image Concept |
|-----------|---------------|
| AI Product Photography for E-commerce | Flat lay of beauty products on marble with dramatic studio lighting, camera and laptop nearby |
| Virtual Try-On Technology | Fashion model in a bright studio, phone screen showing virtual outfit overlay |
| E-commerce Visual Content Strategy 2026 | Creative director's desk with multiple product photos spread out, color swatches, mood board |
| AI Model Photography & Diverse Representation | Grid of diverse models wearing the same outfit in different poses, studio backdrop |
| Automated Product Listing Images at Scale | Warehouse shelf of products with floating holographic product cards being generated |
| Brand Consistency with AI-Generated Visuals | Side-by-side product photos showing perfect color/lighting consistency across a brand |

### Changes

**1. New edge function `supabase/functions/generate-blog-images/index.ts`**
- Takes a prompt, calls the AI image generation model
- Converts the base64 result to a file and uploads to `landing-assets/blog/` bucket
- Returns the public URL

**2. `src/data/blogPosts.ts`**
- Add `coverImage?: string` field to the `BlogPost` interface
- Add the generated image URLs to each blog post entry

**3. `src/pages/BlogPost.tsx`**
- Display the hero image in the header area — full-width with a subtle overlay gradient behind the title
- Add `loading="lazy"` and use `ShimmerImage` for smooth load

**4. `src/pages/Blog.tsx`**
- Show cover images on blog listing cards (featured card gets a large image, regular cards get thumbnails)

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/generate-blog-images/index.ts` | New edge function to generate and upload images |
| `src/data/blogPosts.ts` | Add `coverImage` field and URLs |
| `src/pages/BlogPost.tsx` | Display hero image in article header |
| `src/pages/Blog.tsx` | Show cover images on listing cards |

