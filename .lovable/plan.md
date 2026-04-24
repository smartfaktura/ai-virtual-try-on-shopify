## Goal

Update the `/home` page so that:
1. The "From one product photo to every asset you need" section gets a **category pill switcher** (Swimwear + Fragrance), 12 cards per category, with the last card hidden on mobile (so mobile shows 9, desktop shows 12).
2. Other home sections that still use abstract gradient placeholders (`HomeCategoryExamples`, `HomeOnBrand`, `HomeQualityProof`, `HomeCreateCards`, `HomeHowItWorks`) get filled with real, category-relevant scene preview images — same image-optimization rules (no `width`, quality only) used in the hero so nothing zooms in.

## 1. `HomeTransformStrip.tsx` — add Fragrance + 2 swim scenes + pill switcher

### Pills (top of section)
Two pills: **Swimwear** (default) · **Fragrance**. Same minimalist pill style used elsewhere on the marketing pages (rounded-full, active = `bg-foreground text-background`, inactive = `bg-muted text-muted-foreground`). Switch via `useState`.

### Swimwear cards (12 total → 9 on mobile)
Slot 1: Original (Ghost Mannequin Shot — same as today).
Slots 2–12 (in order): Architectural Stair, Sunbathing Editorial, Golden Horizon, Textured Bikini Back, Coastal Camera, Yacht Bow Editorial, Rocky Coast Editorial, Minimal Horizon, Cliffside Beach Walk, **Shoreline Adjust Swim Moment**, **Sunstone Wall Swim Editorial**.

Mapping (new):
| Slot | Label | Source id |
|---|---|---|
| 11 | Shoreline Adjust | `1776574249450-gizx6h` |
| 12 | Sunstone Wall | `1776574255634-kmhz9g` |

### Fragrance cards (12 total → 9 on mobile)
Slot 1: **Original** = uploaded green Verdén 317 bottle (`user-uploads://freestyle-1_15.jpg`) → copy to `src/assets/home-hero-original-fragrance.jpg`, import as ES module.
Slots 2–10 (user-listed scenes): Volcanic Sunset, Dynamic Water Splash, Motion Blur Float, Frozen Aura, Natural Light Backdrop, Earthy Botanicals Plinth, Near Face Hold, Dark Elegance, Warm Neutral Studio.
Slots 11–12 (need 2 more to reach 12): pick another nice variant of an existing scene to keep visual rhythm — use a second variant of Volcanic Sunset (`volcanic-sunset-3`) and Frozen Aura (`frozen-aura-2`), labeled "Volcanic Sunset II" / "Frozen Aura II". This keeps mobile (9) clean — these two extra cards fall in slots 10–11 of the desktop second row and are hidden on mobile.

Confirmed scene preview image IDs:
- Volcanic Sunset → `1776847680436-3svy5f`
- Dynamic Water Splash → `1776018020221-aehe8n`
- Motion Blur Float → `motion-blur-float-fragrance-1776013400244`
- Frozen Aura → `1776018027926-ua03bd`
- Natural Light Backdrop → `1776018032748-kg4bn6`
- Earthy Botanicals Plinth → `1776018021309-gfgfci`
- Near Face Hold → `near-face-hold-fragrance-1776013185169`
- Dark Elegance → `1776018015756-3xfquh`
- Warm Neutral Studio → `1776018040785-dq78y5`
- Volcanic Sunset II → `1776843791659-3oq68h`
- Frozen Aura II → `1776835749003-43ooe1`

### Mobile-hide rule (show 9 / hide 3 last)
Grid stays `grid-cols-3 sm:grid-cols-6`. With 12 cards on a 3-col mobile that would be 4 rows. To get 9 on mobile = 3 rows, the **last 3 cards** get class `hidden sm:block` (mobile hides slots 10, 11, 12). Desktop (≥sm) shows all 12 in 2 rows × 6.

### Card behavior
Reuse current `GridCard` (no zoom — `getOptimizedUrl(src, { quality: 60 })`, no `width`). The `Original` badge style (top-right pill) stays the same. For local imported assets (fragrance original), pass through as-is — `getOptimizedUrl` already returns non-Supabase URLs unchanged.

### Subheading copy
Make it dynamic per category:
- Swimwear → "See what your swimwear can become."
- Fragrance → "See what your fragrance can become."

## 2. Fill remaining image placeholders on `/home`

Replace the gradient/shape mockups in these sections with real scene images (3:4 aspect, `object-cover`, `quality: 60`, no width):

### `HomeCategoryExamples.tsx`
Each of the 4 category cards currently shows 3 abstract gradient tiles. Replace with 3 real scene previews per category that match the category theme:
- **Beauty & skincare** → Near Face Hold (beauty), Natural Light Backdrop, Warm Neutral Studio
- **Fashion & accessories** → Flash Night Fashion, Greenhouse Elegance, Quiet Luxury Museum Staircase
- **Jewelry** → Earthy Botanicals Plinth, Dark Elegance, Volcanic Sunset
- **Home & lifestyle** → Natural Light Backdrop variant, Earthy Botanicals Plinth variant, Warm Neutral Studio variant

Same `aspect-square rounded-xl overflow-hidden` shell, image swapped in.

### `HomeCreateCards.tsx`
Each card has a large gradient hero panel with a fake "product" rectangle inside. Replace with a single real preview image (`object-cover`) matching each card's intent. Read file first to map exactly which card → which scene; pick from dresses, swim, fragrance previews already in use.

### `HomeOnBrand.tsx`
The 3-tile brand-consistency grid → use 3 same-category previews (e.g. 3 fragrance variants) to visually communicate "consistent style".

### `HomeQualityProof.tsx`
The bento grid of gradient panels → fill with high-impact previews (Yacht Bow swim, Volcanic Sunset fragrance, Flash Night fashion, etc.), preserving the panel sizes / spans.

### `HomeHowItWorks.tsx`
Step illustrations currently use gradient shape tiles. Step 1 ("upload") → keep ghost mannequin Original. Step 2 ("pick scenes") → 4 scene thumbs (one highlighted). Step 3 ("get assets") → 6-up grid of mixed previews.

All use the same no-zoom optimization rule.

## 3. Memory

Existing memory `mem://style/image-optimization-no-crop` already covers the no-`width` rule — no new memory needed.

## Files to edit / create

- Create: `src/assets/home-hero-original-fragrance.jpg` (copied from upload)
- Edit: `src/components/home/HomeTransformStrip.tsx` (pill switcher + Fragrance category + 2 new swim scenes + mobile-hide last 3)
- Edit: `src/components/home/HomeCategoryExamples.tsx`
- Edit: `src/components/home/HomeCreateCards.tsx`
- Edit: `src/components/home/HomeOnBrand.tsx`
- Edit: `src/components/home/HomeQualityProof.tsx`
- Edit: `src/components/home/HomeHowItWorks.tsx`

## Out of scope

- No DB/RLS/auth changes.
- Pricing, FAQ, Final CTA, Footer, Hero — already real / text-only, untouched.
- No new memory entries.
