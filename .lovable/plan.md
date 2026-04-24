## Goals

1. Make `/home` visuals feel more editorial by switching the dominant aspect ratios from horizontal/square to **portrait (3/4 or 4/5)**.
2. Stop showing the same swimwear images in two consecutive `HomeHowItWorks` steps.
3. Rebuild `HomeOnBrand` so the right-side grid uses **one single scene rendered with 4 different products** (real proof of "on-brand consistency"), with copy that matches the visual.
4. **Remove** the `HomeQualityProof` section ("See the quality before you commit").

---

## Section-by-section changes

### 1. `src/pages/Home.tsx`
- Remove the `<HomeQualityProof />` import + render.

### 2. `src/components/home/HomeQualityProof.tsx`
- Delete the file (no longer referenced).

### 3. `src/components/home/HomeCreateCards.tsx` ("What do you want to create first?")
- Change card visual from `h-80 sm:h-96` to a true portrait **`aspect-[4/5]`** container.
- Keep the same 3 curated images, no zoom (quality-only optimization stays).

### 4. `src/components/home/HomeCategoryExamples.tsx` ("Built for visually demanding products")
- Replace the inner 3-column `aspect-square` strip with a **portrait hero + 2 portrait thumbs** layout per card:
  - Big card image: `aspect-[3/4]` (full width of the card).
  - 2 smaller portraits below in a 2-col grid, also `aspect-[3/4]`.
- Keeps the 4-category outer grid (`lg:grid-cols-4`).

### 5. `src/components/home/HomeHowItWorks.tsx` ("How it works")
- **Step 2 ("Choose what you want to create")** — replace the 3 swim previews with 3 **different content-type previews** so it visually maps to "choose what to create":
  - Product image option → `1776688965090-edaogg` (On-Model Front)
  - Ad creative option → `1776689318257-yahkye` (Flash Night Campaign)
  - Video option → `1776843776495-iyiigl` (Earthy Botanicals)
- **Step 3 ("Generate and refine")** — keep the swim 4-up grid (this is the actual "generated outputs" moment). Now there is no overlap with Step 2.
- Switch step-card from `aspect-[3/2]` to **`aspect-[4/5]` on mobile, `aspect-[3/4]` on desktop**, so the mock screens feel portrait/editorial instead of horizontal letterbox.
- Inner thumbs in step 2 + 3 become `aspect-[3/4]`.

### 6. `src/components/home/HomeOnBrand.tsx` ("Keep every visual on-brand")
- Replace the current 4 mismatched fragrance scenes on the right with **one scene rendered across 4 different products**, sourced from `discover_presets` where `scene_ref = 'mid-century-modern-lounge'` (fashion category, 6 variations available — pick the 4 strongest).
- Image URLs (already in DB, public bucket):
  - `freestyle-images/.../46ac001d-4973-4d6d-a2a9-6df9f42ec685.png` — Minimalist Elegance
  - `freestyle-images/.../45ce1281-da04-429e-b661-34877e664516.jpg` — Sculptural Serenity
  - `tryon-images/.../5f0fd146-fc8d-43a4-a30e-1abbe67f4512.png` — Olive Green Set with Woven Bag
  - `tryon-images/.../cd8b0f5c-4d27-4291-886b-5347b5a3417f.png` — Effortless Elegance
- Switch right-side grid from `aspect-square` to **`aspect-[3/4]`** for vertical consistency.
- Update copy to match the visual:
  - **H2**: "One scene, every product — perfectly on-brand"
  - **Sub**: "Lock your visual direction once. Every new product drops into the same scene, lighting, and mood — so your catalog always looks like one brand."
  - Update the bullet "Visual direction" pill labels to match the actual scene shown:
    - `Scene · Mid-century lounge`
    - `Lighting · Soft warm daylight`
    - `Palette · Olive, cream, walnut`
    - `Composition · Editorial wide`
    - `Mood · Quiet luxury`

### 7. Image optimization rule (unchanged)
- Continue using `getOptimizedUrl(src, { quality: 60 })` everywhere — no `width` parameter (prevents server-side zoom/crop).

---

## Out of scope
- `HomeTransformStrip` (the swimwear/fragrance grid) is not changing — it already uses `aspect-[3/4]`.
- Hero, FAQ, Pricing, FinalCTA, WhySwitch, Footer, Nav unchanged.

---

## Files touched
- edit `src/pages/Home.tsx`
- delete `src/components/home/HomeQualityProof.tsx`
- edit `src/components/home/HomeCreateCards.tsx`
- edit `src/components/home/HomeCategoryExamples.tsx`
- edit `src/components/home/HomeHowItWorks.tsx`
- edit `src/components/home/HomeOnBrand.tsx`
