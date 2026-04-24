## Goals

1. Replace the current "How it works" section with a tighter, mock-driven layout matching the uploaded reference (desktop = 3 columns side-by-side with arrows; mobile = single stacked column with down arrows).
2. Add a third pill labelled **"35+ Categories · 1000+ Scenes"** to the "From one product photo to every asset you need" section, alongside Swimwear / Fragrance / Eyewear — clicking it shows a category-collage grid emphasizing breadth.
3. Update the section's title + subtitle so it reads as a universal "any e-commerce category" pitch rather than a swimwear-only one.

---

## 1. Replace `HomeHowItWorks`

Rewrite `src/components/home/HomeHowItWorks.tsx` to match the reference:

**Header**
- Eyebrow: `HOW IT WORKS` (uppercase, tracked, muted)
- Title: `Create visuals in minutes`
- Sub: `Upload one product image, choose from 1000+ ready-made shots, and generate brand-ready visuals fast.`

**Three step mocks (rendered in `lg:grid-cols-3` with chevron `→` separators on desktop, stacked column with `↓` separators on mobile)**

- **1. Upload** — soft rounded card containing a faded product silhouette (use the existing `originalFragrance` / pump-bottle hero asset from `src/assets/`, dimmed via `opacity-30 grayscale`).
- **2. Choose shots** — card with a small `1000+ shots` chip + faux search bar + 2x2 grid of placeholder thumbs (real scene previews at low opacity so the mock reads as wireframe).
- **3. Generate** — card with 3 stacked "result" rows (thumb + two text bars) like the reference.

**CTA strip**
- Big black pill button: `Start generating` → links to `/auth`.
- Tiny muted line under it: `No studio. No models. No complex setup.`

All cards use `aspect-[4/5] sm:aspect-[3/4]`, `rounded-3xl`, `bg-white`, `border border-border/60`, soft shadow — matching the existing visual language. Arrows are `lucide-react`'s `ArrowRight` (desktop) / `ArrowDown` (mobile), muted color.

No `<StepVisual>` mocks remain — fully replaced.

---

## 2. Add "35+ Categories · 1000+ Scenes" pill to `HomeTransformStrip`

Edit `src/components/home/HomeTransformStrip.tsx`:

- Add a new entry to `CATEGORIES`:
  ```ts
  { id: 'all', label: '35+ Categories · 1000+ Scenes', cards: ALL_CATEGORIES_CARDS, copy: '...' }
  ```
- Build `ALL_CATEGORIES_CARDS` (12 cards, mobile shows first 9) by sampling **one strong preview per category** from existing imports/PREVIEWs already in this file plus a few more pulled from the eyewear/fragrance/swim sets — each card label = the category name (Swimwear, Fragrance, Eyewear, Beauty, Fashion, Jewelry, Footwear, Bags, Activewear, Home, Accessories, Watches). No "Original" badge in this set — every card shows a category name overlay.
- Pill UI: when label is long (`'35+ Categories · 1000+ Scenes'`), allow it to wrap to a two-line pill on mobile by adding `whitespace-nowrap sm:whitespace-normal` adjustments — actually keep `whitespace-nowrap` and let the pill scroll horizontally on mobile (the pill bar gets `overflow-x-auto scrollbar-hide` wrapper).

---

## 3. New title + subtitle for the section

Replace heading/subhead in `HomeTransformStrip`:

- **Title**: `One product photo. Every shot your brand needs.`
- **Subtitle (default)**: `Whatever you sell — swimwear, fragrance, eyewear, beauty, fashion — VOVV turns one image into 1000+ on-brand shots across 35+ categories.`
- Keep the per-pill `copy` line but make it secondary (smaller, below the main subtitle, italic muted) — so the universal value prop is always visible and the per-category line just confirms what they're previewing.

CTA below the grid (already exists: `Try it on my product`) stays.

---

## Files touched
- rewrite `src/components/home/HomeHowItWorks.tsx`
- edit `src/components/home/HomeTransformStrip.tsx`
