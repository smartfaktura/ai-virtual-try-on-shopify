## Goal
Refine `/home`: clearer Models copy, remove the "AI Creative Studio" team section, swap Watches grid for Creative Shots, add a CTA under the 1600+ scenes section, and add a typewriter effect on the hero subline with rotating motivating phrases.

---

## 1. Hero — typewriter effect on the second line
File: `src/components/home/HomeHero.tsx`

- Keep `One product photo.` static.
- Replace the static `<span>AI creates the rest.</span>` with a typewriter component that cycles through 5–6 short, motivating, brand-on phrases. Each phrase types in, holds ~1.6s, then deletes and the next types in.
- Phrases (all start with a verb so the line reads "AI [does the rest]" naturally; we'll just type the full phrase rather than prefix "AI"):
  - `AI shoots every angle.`
  - `AI styles every scene.`
  - `AI runs your photoshoot.`
  - `AI fills your product page.`
  - `AI creates your campaign.`
  - `AI ships visuals in minutes.`
- Implementation: small inline `Typewriter` component (no new dep) using `useEffect` + `setTimeout`; respects `prefers-reduced-motion` (falls back to a static rotation with `animate-fade-in`). A blinking caret `▍` (1s ease-in-out) sits at the end and uses the `text-[#4a5578]` color so it matches the existing accent.
- Add `min-h-[1.16em]` and `inline-block` to the typewriter span so the line height never jumps as the text changes length.

## 2. Models — clearer title + tighter eyebrow, no em-dash
File: `src/components/home/HomeModels.tsx`

- Eyebrow: `Models · {n}+ ready-to-shoot` (already short — keep as-is).
- New title: **Pick a model. Start shooting.** (clear and direct).
- New subtitle (no em-dash, sentence case): *"40+ professional AI models across body types, ethnicities, and ages. Or train your own brand model in minutes and reuse it on every product, forever."*

## 3. Remove the "AI Creative Studio / 10 specialists" section
File: `src/pages/Home.tsx`

- Remove the `import { HomeStudioTeam } from ...` line.
- Remove `<HomeStudioTeam />` from the JSX (between `HomeWhySwitch` and `HomeOnBrand`).
- Leave the `HomeStudioTeam.tsx` file in place (no other consumers; safe to keep around, can be deleted later if desired).

## 4. Watches → Creative Shots
File: `src/components/home/HomeTransformStrip.tsx`

Replace the current `WATCHES_CARDS` (which is mostly packshot angles: Front View, Side View, Angle View, etc.) with 12 verified Creative-Shots scenes pulled from `product_image_scenes` where `category_collection ILIKE '%watch%'` and `sub_category = 'Creative Shots'`. New cards:
- On-Wrist Studio (kept as Original)
- Amber Glow Studio
- Concrete Shadow Play
- Dark Elegance
- Dynamic Water Splash
- Earthy Glow Stage
- Frozen Aura
- Gradient Backdrop Elegance
- Moody Wet Concrete
- Volcanic Sunset
- Reflective Floral Display
- Botanical Oasis

All preview URLs verified to exist.

## 5. 1600+ scenes — better copy + CTA
File: `src/components/home/HomeEnvironments.tsx`

- Eyebrow: `1600+ scenes` (kept).
- Title: **Place your product anywhere.** (clearer than "Every environment. One click.").
- Subtitle: *"Studio, lifestyle, editorial, streetwear, seasonal. Pick a scene and your product is dropped in instantly."* (no em-dash).
- Add a CTA block immediately under the marquee (inside the same wrapper, before the section closes): a dark `bg-foreground` pill linking to `/product-visual-library` — *"Browse the full scene library →"* — with a small subline *"1600+ scenes across 35+ categories"*. Mirrors the CTA styling used on the `/ai-product-photography` Scene Library section so the brand language stays consistent.

---

## Files touched
- `src/components/home/HomeHero.tsx` (typewriter)
- `src/components/home/HomeModels.tsx` (copy)
- `src/components/home/HomeTransformStrip.tsx` (Watches cards)
- `src/components/home/HomeEnvironments.tsx` (copy + CTA wrapper)
- `src/pages/Home.tsx` (remove HomeStudioTeam usage)