## Goals
1. **FAQ** — rewrite questions/answers in a more engaging, on-brand VOVV.ai voice; add eyebrow + subtitle and small UI polish.
2. **How it works** — replace the redundant "Create visuals in minutes" headline + subhead (it repeats hero copy) with something distinct.
3. **Footer** — swap `HomeFooter` for `LandingFooter` (the original `/` homepage footer) on `/home`.
4. **Trust block** — make it more vibrant, spacious, on-brand VOVV.ai vibe (less plain, more premium).
5. **One scene, every product** — swap the 4 demo images to a fresher same-scene set, and update the "Visual direction" panel copy to match.

---

## 1. `HomeFAQ.tsx` — engaging rewrite

- Add eyebrow `FAQ` (uppercase, tracked, muted) above the title.
- New title: **"Everything you're wondering about VOVV"**
- New sub: **"Quick answers before you start creating."**
- Add `data-[state=open]:shadow-md transition-shadow` on the accordion items for subtle interaction polish.
- Replace the 6 Q&A pairs with sharper, on-brand voice:

1. **How fast can I get my first visual?** — Under a minute. Drop a product photo, pick a shot, hit generate — your first brand-ready image lands before your coffee cools.
2. **Will my visuals actually look on-brand?** — Yes. Lock your scene, lighting and palette once, and every new product slots into the same world. Your catalog stays consistent without re-shoots.
3. **What can I create from a single product photo?** — Product page hero shots, lifestyle scenes, social creatives, ad campaigns, on-model try-ons and short product videos — all from one upload.
4. **Can I use the visuals on Shopify, ads and marketplaces?** — Absolutely. Outputs are commercial-ready and built for Shopify, Amazon, Meta and TikTok ads, email, and DTC product pages.
5. **Do I need design or photography skills?** — None. If you can upload an image, you can use VOVV. Our 1000+ ready-made shots do the art-directing for you.
6. **Is there a free way to try it?** — Yes — start with free credits, no card required. Generate a few visuals, see if it clicks, then upgrade only when you're ready.

---

## 2. `HomeHowItWorks.tsx` — non-redundant header

The hero already promises "Turn one product photo into…", so the section header shouldn't repeat it. Change to a clearly different framing of the *process*:

- Eyebrow stays: `How it works`
- New H2: **"From one product photo to a full shoot"**
- New sub: **"Three steps. No studio, no models, no setup."**
- (Keep step labels `1. Upload`, `2. Choose shots`, `3. Generate` — they're fine.)
- Remove the duplicate "No studio. No models. No complex setup." line below the CTA (since it now lives in the subhead). Replace with: **"Free to start · No card required"**.

---

## 3. Footer swap on `/home`

In `src/pages/Home.tsx`:
- Replace `import { HomeFooter } from '@/components/home/HomeFooter';` with `import { LandingFooter } from '@/components/landing/LandingFooter';`
- Replace `<HomeFooter />` with `<LandingFooter />`
- Leave `HomeFooter.tsx` file in place (still used elsewhere if needed). No deletion.

---

## 4. `HomeTrustBlock.tsx` — vibrant, spacious, on-brand

Make the section feel premium and editorial instead of generic-card-grid:

- **Section bg**: switch from flat `#f5f5f3` to a soft warm gradient + decorative blurred glow blobs to add VOVV energy:
  - `bg-gradient-to-b from-[#FAFAF8] via-[#f5f5f3] to-[#FAFAF8]`
  - Two absolutely-positioned blurred radial blobs (warm amber `bg-amber-200/30` and cool `bg-indigo-200/20`), `blur-3xl`, very low opacity, behind content.
- **Spacing**: bump vertical padding to `py-24 lg:py-40`, widen container to `max-w-[1280px]`, increase gap to `gap-8 lg:gap-10`, taller cards (`p-9 lg:p-10`).
- **Header polish**:
  - Eyebrow: `EARLY ACCESS · BETA`
  - H2 (bigger, tighter): `Loved by the brands building first` — `text-4xl sm:text-5xl`, `tracking-tight`, `mb-5`
  - Sub: `Early creators and DTC teams are already using VOVV to ship visuals faster — here's what they're telling us.`
- **Cards** — premium feel:
  - White card, `rounded-[28px]`, **gradient border** via wrapper (`bg-gradient-to-br from-amber-200/50 via-white to-indigo-200/40 p-[1px] rounded-[28px]` with inner `bg-white rounded-[27px]`).
  - Larger lucide `Quote` icon (size 28), filled with `text-amber-400/30`.
  - Bigger quote text: `text-[17px] leading-[1.6] text-foreground/85 font-[450]`.
  - Add a subtle 5-star row in muted amber above the avatar block (`text-amber-400/80`, size 14, `Star` icon × 5 with `fill="currentColor"`).
  - Avatar circle uses a soft gradient bg per card (warm peach / sage / sky) with bold initials, `w-12 h-12`.
  - Card hover: `hover:-translate-y-1 hover:shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] transition-all duration-300`.
- Keep the small disclaimer: `Early-access feedback from beta testers · Names anonymized.` (slightly more confident wording, smaller and centered).
- Add 3 small **stat chips** under the disclaimer for credibility without lying:
  - `Free credits to start` · `1000+ ready-made shots` · `From upload to result in <1 min`
  - Rendered as horizontal pill-row, neutral muted bg, small uppercase text.

Quotes stay realistic (keep current 3, only minor polish):
1. *"Testing 10 angles for one bag in five minutes — that alone replaces a whole afternoon of shooting."* — **M.L.**, Jewelry founder
2. *"Locking one visual direction across my skincare line keeps the whole catalog feeling like one brand."* — **D.K.**, Skincare brand owner
3. *"I mock up entire campaign concepts before booking the real shoot. Saves a ton of back-and-forth."* — **A.R.**, Ecommerce photographer

---

## 5. `HomeOnBrand.tsx` — new images + matching copy

Swap to the **Amber Glow Studio** set (4 different products, identical scene/lighting — strongest visual demo of the consistency promise):

```ts
const consistentSet = [
  // Obsidian Veil fragrance
  `${SUPABASE_PUBLIC}/freestyle-images/.../2026-04-02_8de3c91b-4553-4517-971f-a06e4ace4fb4.jpg`,
  // Radiant Glow perfume
  `${SUPABASE_PUBLIC}/freestyle-images/.../91418be3-6c16-4573-b97b-8c757b37a792.png`,
  // Bleu de Chanel
  `${SUPABASE_PUBLIC}/freestyle-images/.../702a108f-1262-428c-a921-c7525aaf19bd.png`,
  // Suede shoulder bag
  `${SUPABASE_PUBLIC}/freestyle-images/.../2026-04-02_aac4c8f5-2c3f-4065-964a-383453499f36.jpg`,
];
```

Update the **Visual direction** panel copy so it matches the new amber scene:

- `Scene · Amber Glow Studio`
- `Lighting · Warm directional spotlight`
- `Palette · Amber, charcoal, cream`
- `Composition · Centered hero`
- `Mood · Editorial luxury`

Keep the small caption above the grid: `Same scene · 4 products`.

---

## Files
- edit `src/components/home/HomeFAQ.tsx`
- edit `src/components/home/HomeHowItWorks.tsx`
- edit `src/pages/Home.tsx` (footer swap)
- edit `src/components/home/HomeTrustBlock.tsx`
- edit `src/components/home/HomeOnBrand.tsx`
