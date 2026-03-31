

## Replace Blog Cover Images with Discover Triptych Banners

### What
Replace all 6 blog post cover images (currently local assets in `src/assets/blog/`) with combined 3-image triptych banners created from Discover preset images, matching each blog post's theme.

### Image selections per blog post

**1. AI Product Photography for E-commerce** (`ai-product-photography-for-ecommerce`)
- Radiant and captivating (commercial)
- Nature


<lov-tool-use id="thinking-546b07d5-6b94-4e64-8341-b0d7edfb6b10" name="lov-think" data="Let me continue with the plan from where I left off." duration="0.443183">
</lov-tool-use>
<lov-plan>

## Replace Blog Cover Images with Discover Triptych Banners

### What
Replace all 6 blog post cover images (currently local `src/assets/blog/*.jpg`) with combined 3-image horizontal triptych banners built from Discover preset images. Each banner combines 3 thematically relevant images side-by-side. The 7th blog post already uses Discover images — no change needed there.

### Banner image selections (3 per blog post)

**1. AI Product Photography for E-commerce**
- Studio Chair Pose (fashion) + BYREDO Gypsy Water on Ice (fragrances) + Sanctuary Armchair (home)
- Mix of fashion, product, and lifestyle = broad e-commerce appeal

**2. Virtual Try-On Technology**
- Effortless Chic (try-on result) + Cozy Morning Activewear (try-on) + The Gaze of Blue (fashion)
- All fashion/on-model shots showing the try-on concept

**3. E-commerce Visual Content Strategy**
- Fisheye Fashion Editorial + Sky Product Portrait + Nordic Allure in Amber Spotlight
- Diverse visual styles showing content variety

**4. AI Model Photography & Diverse Representation**
- Minimalist Studio Fashion + Gradient Blue Studio + Radiant and captivating
- Different models/styles showing diversity

**5. Automated Product Listing Images**
- Medik8 Crystal Retinal 6 (beauty product) + Rustic Kitchen (product editorial) + Lumière Skin Serum in Hand (beauty)
- Product-focused shots showing catalog variety

**6. Brand Consistency with AI**
- Clean Studio Look + Sculpted in Comfort + Pilates Studio Glow
- Consistent studio aesthetic showing brand cohesion

### Technical approach

1. **Generate 6 banners** using a Python script (Pillow) — download 3 images each, center-crop to equal panels, combine side-by-side with thin white gaps into a 16:9 banner (1440×810)
2. **Upload all 6** to Supabase storage under `freestyle-images/blog/`
3. **Update `src/data/blogPosts.ts`**:
   - Remove the 6 local image imports (lines 1-6)
   - Replace each post's `coverImage` with the Supabase storage URL
4. **Delete `src/assets/blog/` directory** — no longer needed (reduces bundle size)

### Files changed
- `src/data/blogPosts.ts` — remove local imports, update all 6 coverImage URLs to Supabase storage triptych banners

