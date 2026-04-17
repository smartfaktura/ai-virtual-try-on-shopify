
## Goal
Resolve P1 factual conflicts and apply P2 polish — frontend text only. No routes, slugs, file names, props, types, or backend touched.

---

## Part 1 — P1 Factual Fixes

### 1.1 Visual Types count → **seven** (add Picture Perspectives to LandingFAQ)
**`src/components/landing/LandingFAQ.tsx:17`**
- Current: "Choose from six core options — Virtual Try-On, Product Listing, Selfie / UGC, Flat Lay, Mirror Selfie, and Interior / Exterior Staging"
- Replace: "Choose from **seven core options** — Virtual Try-On, Product Listing, Selfie / UGC, Flat Lay, Mirror Selfie, **Picture Perspectives**, and Interior / Exterior Staging"

### 1.2 TryShot signup credits → **20**
**`src/pages/TryShot.tsx:344`**
- Current: "Get 60 free credits when you sign up."
- Replace: "Get **20 free credits** when you sign up."

### 1.3 Brand Model pricing FAQ → free public model + 20 credits/generation
**`src/pages/AppPricing.tsx:92`**
- Current: "A standard image is ~4–6 credits depending on complexity. Video generation runs 30–60 credits per clip. 4K upscaling is ~5 credits. Brand Model training is a one-time ~50 credits per model. You always see the cost before you generate."
- Replace: "A standard image is 4–6 credits depending on complexity. Video generation runs 30–60 credits per clip. 4K upscaling is ~5 credits. **Brand Model generation is 20 credits per image; adding a public Brand Model is free.** You always see the cost before you generate."

### 1.4 Blog credit cost factual fix
**`src/data/blogPosts.ts:906`**
- Current: "Most images cost 1–3 credits depending on quality settings."
- Replace: "Most images cost **4–6 credits** depending on quality settings."

---

## Part 2 — P2 Polish

### 2.1 Hyphenation sweep: `ecommerce` → `e-commerce` (visible body copy only)
Update these user-visible strings (skip route paths, file names, slugs, internal token strings like `ecommerce_scene_type`, blog banner filenames, lib comments):

| File:line | Replace |
|---|---|
| `src/components/home/HomeCategoryExamples.tsx:12` | "ecommerce visuals" → "e-commerce visuals" |
| `src/components/home/HomeFAQ.tsx:27` | "designed for ecommerce visuals" → "designed for e-commerce visuals" |
| `src/components/home/HomeFooter.tsx:49` | "for ecommerce brands" → "for e-commerce brands" |
| `src/components/home/HomePricingTeaser.tsx:6` | "Built for ecommerce brands" → "Built for e-commerce brands" |
| `src/pages/AppPricing.tsx:100` | "ads, ecommerce, packaging" → "ads, e-commerce, packaging" |
| `src/pages/Home.tsx:24, 38` | "for ecommerce brands" / "Create ecommerce visuals" → "e-commerce" |
| `src/pages/seo/AIProductPhotographyEcommerce.tsx` (lines 82, 84, 92, 93, 95, 96, 97, 99, 106, 230, 318, 404, 562, 563, 626, 629, 638) | All visible-body "ecommerce" → "e-commerce". **Keep the file name, route `/ai-product-photography-for-ecommerce`, and any URL/slug references unchanged.** |

### 2.2 Sign-in wording standardization
**`src/pages/ResetPassword.tsx:70`**
- "Back to login" → "Back to sign in"

**`src/pages/Auth.tsx`**
- Line 174: "Enter your email to get a login link" → "…to get a **sign-in link**"
- Line 193: "Could not send login link." → "Could not send **sign-in link**."
- Line 394: "We sent a login link to" → "We sent a **sign-in link** to"

**`src/pages/Status.tsx:34`**
- "Login, signup, and session management" → "**Sign-in, sign-up,** and session management"

---

## Out of scope (intentionally untouched)
- Route paths, slugs (`/ai-product-photography-for-ecommerce`, blog slug `ai-product-photography-for-ecommerce`, `ecommerce-visual-content-strategy-2026`)
- File/component names (`AIProductPhotographyEcommerce.tsx`)
- Internal token strings (`ecommerce_scene_type`, `analysis.ecommerce_scene_type`)
- Code comments in `src/lib/videoStrategyResolver.ts`, `src/lib/catalogEngine.ts` (prompt internals)
- Blog filename references (`blog-ecommerce.jpg`)
- `BrandModels.tsx:686` (already correct — admin-only public toggle, free generation when checked)
- Existing blog `metaDescription` strings already using "e-commerce" (no change)

## Acceptance
- LandingFAQ shows seven Visual Types including Picture Perspectives
- TryShot promises 20 free credits (consistent with rest of site)
- AppPricing FAQ correctly states Brand Model = 20 cr/generation, public = free
- Blog post says 4–6 credits per image
- All user-visible "ecommerce" → "e-commerce" across home, SEO page, AppPricing
- All visible auth surfaces use "sign in / sign-in / sign-up" consistently
- Zero route, slug, file-name, type, or backend changes
- ~30 strings updated across ~10 files
