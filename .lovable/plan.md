## Plan — Customer support answers: copy-only refresh

Scope: rewrite stale support/FAQ copy so it matches what we currently offer. **No UI, routes, or pricing logic — text only.**

### Current offering (truth to write to)

- **Product Visuals** — 6 credits per image (flat)
- **Brand Models** — 20 credits per generated image; using a public Brand Model is free
- **Brand Scenes** *(new)* — design a custom, reusable scene from your own brief or a single reference photo. Each generation produces **3 variations for 20 credits**. Saving a scene is free; re-using a saved scene generates Product Visuals at the standard 6 credits each. Creation is available on **Growth, Pro, and Enterprise** plans (Free and Starter can still use any scenes they already saved).
- **Swap Product** — re-render a saved scene with a different product, 6 credits
- **Animate video** — 25 credits (5s) · 50 credits (10s) · premium motion = 2× the base · ambient audio included
- **Start & End video** — 35 credits flat
- **Upscaling** — 4K only, 15 credits
- **Plans** — Free 20 · Starter 500 · Growth 1,500 · Pro 4,500 · Enterprise unlimited

### Removed from all support copy
- Short Film generation
- Virtual Try-On
- 2K upscaling tier
- "1 credit", "4–10 credits", "30 credits flat video", "one-time 50-credit Brand Model training"

### Files and edits

**1. `src/components/faq/FAQAccordion.tsx` (line 43)**
Rewrite credit answer with the full breakdown above (incl. Brand Scenes line). Drop Short Film + 2K upscale.

**2. `src/components/landing/LandingPricing.tsx` (line 120)**
Same rewrite.

**3. `src/data/faqContent.ts`**
- Line 17: Visual Types list → remove Virtual Try-On; rename "Product Listing" → "Product Visuals"; mention Brand Scenes as a way to lock in a signature look.
- Line 42 ("How do credits work?"): Product Visuals 6 · Brand Scenes 20/generation (3 variations) · Animate 25/50 · Start & End 35 · 4K upscale 15 · Brand Model 20/image.
- Append two new Q&As under Features:
  > **Q:** What are Brand Scenes?
  > **A:** A Brand Scene is a custom, reusable scene you design once — either by answering a short brief or by uploading a single reference photo — and then re-apply to any product. Each generation produces 3 variations for 20 credits. Saving the scene is free; reusing it later costs 6 credits per Product Visual. Available on Growth, Pro, and Enterprise plans.

  > **Q:** Can I reuse a scene with a different product?
  > **A:** Yes. Open any image from your Library or a generation result and click **Swap Product**. We re-render the exact scene with your new product, preserving lighting, composition, and styling. 6 credits.

**4. `src/components/howitworks/HowItWorksFAQ.tsx` (line 11)**
Replace "1 credit" claim with: Product Visuals 6 · Brand Scenes 20 per 3-variation generation · Animate from 25 · 4K upscale 15 · Free trial 20 credits.

**5. `src/pages/AppPricing.tsx` (line 95)**
Rewrite to current pricing only (incl. Brand Scenes, no Short Film, no 2K upscale).

**6. `supabase/functions/studio-chat/index.ts` (SYSTEM_PROMPT)**
- Fix Animate: 10s = 50 credits; premium motion = 2× base; remove "+4 ambient audio".
- Remove the Short Film section entirely.
- Remove Virtual Try-On from any Visual Types list.
- Upscaling reference → "4K, 15 credits" (drop 2K).
- Update Product Visuals cost to flat 6 credits.
- Add a Brand Scenes capability paragraph (what it is, 20 credits for 3 variations, plan gating, reuse at 6 credits).
- Add a one-line Swap Product capability note.

**7. `src/components/app/GenerationModeCards.tsx` (line 32)**
"4–10 credits per image" → "6 credits per image".

### Memory updates after copy ships
- Update `mem://features/studio-chat-knowledge-source`: Short Film + Virtual Try-On removed, upscale = 4K only, Brand Scenes added.
- Update Core memory if it lists removed Visual Types.

### Out of scope
Routes, in-app cards, `CreditContext.calculateCost`, `videoCreditPricing.ts`, navigation, component layouts.