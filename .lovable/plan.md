## Goal
Polish `/ai-product-photography`: replace hero category labels with real category images + names, fix the loader's size jitter, make the category chooser denser with vertical cards, retitle the scene library section to "1600+ scenes" with a CTA to `/product-visual-library`, and refine the How It Works step icons.

---

## 1. Hero — show categories instead of generic labels
File: `src/components/seo/photography/PhotographyHero.tsx`

Replace the hardcoded `row1` / `row2` ("Product page", "Lifestyle", etc.) with tiles built from `aiProductPhotographyCategories`:
- Each tile uses `cat.previewImage` and `cat.name` as the label (Fashion, Footwear, Beauty & Skincare, Fragrance, Jewelry, Bags & Accessories, Home & Furniture, Food & Beverage, Supplements & Wellness, Electronics & Gadgets).
- Split the 10-item list into two rows (5 + 5) and double inside `MarqueeRow` for seamless loop.
- Slow the marquee a touch (50s / 55s) since each tile now has more meaning.
- Keep the existing tile styling and label gradient.

## 2. Loader — stop the size shift on `/ai-product-photography`
File: `src/components/ui/brand-loader-progress-glyph.tsx`

The `animate-glyph-breathe` class on the VOVV.AI wordmark animates `letter-spacing -0.01em → 0.02em` (defined in `index.css`), which visibly resizes the wordmark width while loading. Remove `animate-glyph-breathe` from the wordmark `<span>` so the text stays a fixed size. The underline sweep (`animate-glyph-sweep`) stays — it's the actual progress affordance.

## 3. Category Chooser — vertical cards, denser grid
File: `src/components/seo/photography/PhotographyCategoryChooser.tsx`

- Image aspect: `3/4` (vertical) instead of `4/3`.
- Grid: `grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 lg:gap-5` (mobile 2/row, tablet+desktop 4/row).
- Move the category name + "{n}+ shots" eyebrow on top of the image with a bottom gradient overlay (cleaner, more editorial feel).
- Below the image: 3-line clamped description and a small "Explore {Name} →" link.
- Drop the subcategory chip cloud (too dense for a 4-col grid). Subcategories still live in the data file for future per-category sub-pages.
- Card radius `rounded-2xl`, padding `p-4 lg:p-5`.

## 4. Scene Examples — retitle to "1600+ scenes" + CTA to library
File: `src/components/seo/photography/PhotographySceneExamples.tsx`

- Eyebrow: `Scene library`
- H2: **1600+ scenes**
- Subtitle (short): *Studio, lifestyle, editorial, seasonal — one click.*
- Replace the bottom anchor link with a primary CTA pill linking to `/product-visual-library`:  
  *"Browse the full scene library →"* (dark `bg-foreground` pill matching the page's premium tone).
- Keep the 10-tile grid as-is.

## 5. How It Works — refined step icons
File: `src/components/seo/photography/PhotographyHowItWorks.tsx`

- Replace `Upload / Palette / Sparkles` with `ImagePlus / Wand2 / Sparkles` — more on-brand for AI image generation.
- Redesign the icon presentation: a single 48×48 rounded-square chip with `bg-[#1a1a2e]` and white icon (mirrors the dark-primary accent used across the page) instead of the small "1" circle + ghost icon combo.
- Move the step number to a subtle `01 / 02 / 03` mono label in the top-right corner of each card (quiet, editorial).
- Heading still tracks tight; spacing unchanged so the row still aligns with the connector arrows.

---

## Files touched
- `src/components/seo/photography/PhotographyHero.tsx`
- `src/components/seo/photography/PhotographyCategoryChooser.tsx`
- `src/components/seo/photography/PhotographySceneExamples.tsx`
- `src/components/seo/photography/PhotographyHowItWorks.tsx`
- `src/components/ui/brand-loader-progress-glyph.tsx`