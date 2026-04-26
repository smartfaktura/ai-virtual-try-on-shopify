# Second QA Pass — 5 SEO Landing Pages

## Audit Summary

### 1. Keyword cannibalization — minor issues
- **Generator vs Hub**: Both target "AI product photography / photo generator" but intents are distinct (tool-seeking vs category exploration). H1s, titles, and primary intents are clear. ✓
- **Shopify vs Etsy**: Distinct vertical intent, distinct H1s, distinct category slug filtering, distinct FAQs. ✓
- **vs-Photoshoot vs vs-Studio**: Both are comparisons. Currently overlap on "what AI creates" value cards. Need to differentiate scope:
  - vs-Photoshoot → focus on **decision logic** (when to choose what)
  - vs-Studio → focus on **workflow / operating model** (project vs system)
- **Generator** FAQ "Is AI product photography good for ecommerce brands?" appears on vs-Photoshoot too — slight overlap. Will rephrase on the comparison page to a comparison-framed question.

### 2. Above-the-fold clarity — mostly good, one fix
- Shopify, Etsy, Generator hero blocks immediately signal audience ✓
- Comparison pages clearly framed as comparisons ✓
- **Generator secondary CTA** points to `/how-it-works` (off the conversion path). Will repoint to `/ai-product-photography` (hub) to keep users in commerce funnel and improve internal linking.

### 3. Trust & compliance — needs softening
- **Shopify comparison subtitle** "Slow, expensive, hard to repeat" reads aggressive. Soften to neutral framing.
- **Shopify FAQ** "AI is a strong replacement" → reframe as "AI can cover most of these visuals; review before publishing."
- **Shopify** lacks a brief accuracy/compliance note (Etsy has one). Add a short ShieldCheck strip.
- **vs-Studio** left subtitle "Strong for controlled physical capture" is balanced ✓; left items already neutral ✓
- **vs-Photoshoot** balanced ✓; FAQ "Is AI product photography cheaper than a photoshoot?" "For most ecommerce visuals, yes" — soften slightly to "often yes, depending on volume and channels."
- No page promises sales results ✓. No platform-compliance overpromise after fixes ✓.

### 4. Image & performance — fixes available
- All non-hero images: `loading="lazy"`, `decoding="async"`, `getOptimizedUrl(quality:60)` ✓
- **Hero tiles**: currently all `loading="lazy"`. The first row is part of LCP / above-the-fold on desktop. Mark first row tiles `loading="eager"` and add `fetchPriority="high"` to the first 1–2 tiles to reduce LCP. Add explicit `width`/`height` to all `<img>` in `LandingHeroSEO` and `LandingOneToManyShowcase` to eliminate CLS.
- Marquee uses doubled tiles (good) but with 8–10 tiles × 2 = up to 20 images per row, all decoded. Acceptable, but ensure first row gets priority hints.
- Category grid mobile already shows 2 thumbs only ✓

### 5. CTA hierarchy & tracking readiness
- Primary CTA on every page → `/app/generate/product-images` ✓
- Generator secondary → currently `/how-it-works`; change to `/ai-product-photography`.
- No analytics-ready attributes. Add `data-cta` (e.g. `hero-primary`, `hero-secondary`, `final-primary`, `final-secondary`) to `LandingHeroSEO`, `LandingFinalCTASEO`, and `LandingHowItWorksSteps` CTA buttons. This lets analytics later target specific page+slot pairs without code changes.
- Add `data-page` prop on each CTA component plumbed from page (e.g. `data-page="shopify"`) so events can be filtered by landing page.

---

## Changes to Apply

### A. Components — add CLS-safe images, eager hero, tracking attrs
- `src/components/seo/landing/LandingHeroSEO.tsx`
  - Accept `pageId?: string` prop; emit `data-cta="hero-primary|hero-secondary"` and `data-page={pageId}` on Link buttons.
  - First-row tiles: `loading="eager"`, `fetchPriority="high"` on the first 2.
  - Add `width={210}` `height={280}` to tile `<img>` for CLS.
- `src/components/seo/landing/LandingFinalCTASEO.tsx`
  - Accept `pageId?: string`; emit `data-cta="final-primary|final-secondary"` and `data-page`.
- `src/components/seo/landing/LandingHowItWorksSteps.tsx`
  - Accept `pageId?: string`; tag CTA `data-cta="howitworks-primary"`.
- `src/components/seo/landing/LandingOneToManyShowcase.tsx`
  - Add `width={400} height={400}` (intrinsic only) to thumb `<img>` for CLS reduction.

### B. AIProductPhotoGenerator.tsx
- Hero `secondaryCta` → `{ label: 'Explore AI product photography', to: '/ai-product-photography' }`.
- Pass `pageId="generator"` to hero, how-it-works, final CTA.

### C. ShopifyProductPhotography.tsx
- Comparison `leftSubtitle`: "Slow, expensive, hard to repeat" → **"Higher cost and longer turnaround"**.
- Comparison `rightSubtitle`: "Fast, flexible, always-on" → **"Fast, flexible, repeatable"**.
- FAQ "Can AI product photos replace a Shopify photoshoot?" answer: replace "AI is a strong replacement" with **"AI can cover most of these needs. For exact fit, sizing, or product claims, review final visuals before publishing."**
- Add a small inline ShieldCheck "Accuracy note" strip (single sentence, neutral) before the FAQ — short version of Etsy's pattern.
- Pass `pageId="shopify"` to hero / how-it-works / final CTA.

### D. EtsyProductPhotography.tsx
- Pass `pageId="etsy"` to hero / how-it-works / final CTA.
- (Already has accuracy strip ✓)

### E. AIPhotographyVsPhotoshoot.tsx
- FAQ "Is AI product photography cheaper than a photoshoot?" — soften answer: "Often yes, especially when you need many variations across channels. Costs depend on volume, complexity, and how often visuals refresh."
- Differentiate from vs-Studio: leave the **decision matrix** (already present) as the page's signature section; remove the second "What ecommerce brands can create" `LandingValueCards` block that duplicates Generator content — replace with a tighter "What changes when you switch" 4-card block focused on outcomes (speed, variations, cost flexibility, channel coverage).
- Pass `pageId="vs-photoshoot"` to hero / final CTA.

### F. AIPhotographyVsStudio.tsx
- Already focused on "project vs system" workflow ✓
- Rename eyebrow on the duplicate "What VOVV.AI helps create" cards block to "Output coverage" to differentiate from vs-Photoshoot.
- Pass `pageId="vs-studio"` to hero / final CTA.

### G. Version bump
- `public/version.json` patch increment.

---

## Notes
- No route, sitemap, or schema changes required (Article + Breadcrumb + FAQ + SoftwareApplication already correct).
- No new pages or files. Changes are surgical edits to 5 pages + 4 shared components.
- All `data-cta` / `data-page` attributes are passive — no analytics library wiring in this pass; they're hooks for later GTM/PostHog setup.
- Type-check (`tsc --noEmit`) will run after edits.
