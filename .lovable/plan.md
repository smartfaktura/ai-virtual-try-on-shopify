## /home polish: hero spacing, consistent CTAs, simpler copy, remove pricing teaser

Tighten the visual rhythm of the `/home` landing page so it matches the `/` (LandingHero) hero proportions, unify all CTA buttons, simplify a few section titles/subtitles, remove the redundant "Start free, upgrade when ready" section, and clean up the strange decorative cards behind the final CTA.

---

### 1. Hero (`HomeHero.tsx`) — match `/` hero sizing & rhythm

Current `/home` hero is tighter than the `/` HeroSection. Align both:

- **Top padding**: `pt-24 lg:pt-28` → `pt-28 lg:pt-36` (matches LandingHero `pt-28 sm:pt-36`).
- **Headline → subtitle gap**: `mb-5` → `mb-6`.
- **Subtitle → CTA gap**: `mb-6` → `mb-10` (matches LandingHero).
- **CTA buttons**: keep rounded-full but match `/` Button `size="lg"` proportions:
  - Height `h-[3.25rem]` → `h-[3.25rem]` kept, but text `text-[15px]` → `text-base font-semibold`, padding `px-8` kept.
  - Add subtle shadow consistency `shadow-lg shadow-primary/25` on primary CTA.
- **CTA → trust line gap**: `mb-4` → `mt-8` on the trust badges row (gives more breathing room).
- Bottom marquee stays.

### 2. Unify all `/home` CTA buttons

All other home page CTAs currently use `h-12 px-7 text-[15px] font-medium`. Bring them in line with the hero proportions:

- `HomeFinalCTA.tsx` (Start free / See real examples) → `h-[3.25rem] px-8 text-base font-semibold`.
- `HomeHowItWorks.tsx` "Start Generating Free" → already `h-12 px-10` → bump to `h-[3.25rem] px-10 text-base font-semibold`.
- `HomePricingTeaser.tsx` CTAs — section is being removed (see step 4), so no change needed.

### 3. Improve titles & subtitles across `/home`

Refine copy for premium tone and simpler reading. (Title pairs only — body unchanged unless noted.)

| Section | New title | New subtitle |
|---|---|---|
| `HomeWhySwitch` | **Built to replace slow content production** | **Generate new product visuals in minutes — no shoots, no edits, no waiting.** |
| `HomeCreateCards` | **What do you want to create first?** *(kept)* | **Pick the format you need most. Reuse the same product image for everything else.** |
| `HomeOnBrand` | **One scene. Every product.** | **Lock the look once — every product drops into the same scene, on brand.** |
| `HomeHowItWorks` | **From one product photo to a full shoot** *(kept)* | **Three steps. No studio, no models, no setup.** *(kept)* |
| `HomeTransformStrip` | **Built for every category** *(kept)* — small eyebrow stays |
| `HomeFAQ` | **Everything you're wondering about VOVV** *(kept, normalize apostrophe)* | **Quick answers before you start creating.** *(kept)* |
| `HomeFinalCTA` | **Try it on your product** *(kept)* | **Upload one photo. See what VOVV creates for your brand in minutes.** |

### 4. Remove the "Start free, upgrade when you're ready" section

Delete `<HomePricingTeaser />` from `src/pages/Home.tsx` import + render. The final CTA already covers the same ground, so removing it eliminates duplication. (File `HomePricingTeaser.tsx` stays in repo, unused — safe to keep for now.)

### 5. Clean up the "Try it on your product" final CTA

The "strange placeholders" the user sees are the three faux floating card decorations:
```
<div className="absolute top-12 left-[10%] w-20 h-28 rounded-xl bg-white/5 ..." />
<div className="absolute bottom-16 right-[12%] w-24 h-32 ..." />
<div className="absolute top-1/3 right-[8%] w-16 h-20 ..." />
```
Remove all three. Keep the soft gradient blobs (top-1/4 / bottom-1/4 blur layers) for ambient depth — they read as a polished gradient, not as placeholders.

---

### Out of scope / not changing

- Marquee / image content in hero.
- Section background colors, layout grids, or scroll-reveal animations.
- Navigation bar (already aligned).
- Any data, API, or backend changes — pure UI/copy.

### Files touched

- `src/pages/Home.tsx` — remove `HomePricingTeaser` import + render.
- `src/components/home/HomeHero.tsx` — spacing, CTA sizing.
- `src/components/home/HomeFinalCTA.tsx` — remove decorative cards, bump CTA size, refine subtitle.
- `src/components/home/HomeWhySwitch.tsx` — title + subtitle.
- `src/components/home/HomeCreateCards.tsx` — subtitle.
- `src/components/home/HomeOnBrand.tsx` — title + subtitle.
- `src/components/home/HomeHowItWorks.tsx` — CTA button sizing.
- `src/components/home/HomeFAQ.tsx` — apostrophe normalization.

Approve and I'll implement.