## Goals
1. **HomeCreateCards** — drop the per-card "Explore X" links; replace with a single CTA below the grid (register / start free).
2. **HomeTransformStrip** — fix mobile layout of the category pills (overflow), hide image titles (only keep the "Original" badge), shrink card label on mobile (now: removed entirely), and replace the fragrance scenes that are clearly not fragrance shots (Volcanic Sunset = sunglasses, Frozen Aura II = sneaker — confirmed in screenshot).
3. **HomeTrustBlock** — strip the maximalist look; go fully minimal. Rewrite the Maya quote so it matches her role (jewelry founder ≠ bag tester).
4. **HomeOnBrand** — swap one image URL as the user requested.

---

## 1. `HomeCreateCards.tsx`
- Remove the per-card `<a href="#">Explore X</a>` block at the bottom of each card.
- Remove the `cta` field from `CardData` type and entries.
- Add a single CTA section below the 3-card grid:
  - Headline-less, just a centered button: **"Start creating free"** → `/auth`
  - Small caption underneath: `Free credits · No card required`
- Card body keeps the title + description only.

---

## 2. `HomeTransformStrip.tsx`

### Pills — mobile fit
- The pill row currently uses a single inline-flex container that overflows the parent on mobile (the screenshot shows the row clipped at "All categories ⌄"). Fix:
  - Wrap the inline row inside a centered horizontally-scrollable wrapper that actually scrolls (`overflow-x-auto`) — but also tighten paddings so it usually fits.
  - Reduce pill padding on mobile: `px-3 py-1.5` (was `px-4 sm:px-5 py-2`), keep `text-xs sm:text-sm`.
  - Inner gap: `gap-0.5 sm:gap-1`, container padding `p-0.5 sm:p-1`.
  - "All categories" label shortened on mobile to `All` (use `<span className="sm:hidden">All</span><span className="hidden sm:inline">All categories</span>`).

### Card titles — remove
- In `GridCard`, drop the bottom gradient + label entirely. Only the "Original" pill stays on the original card.
- Removes the `<div className="absolute bottom-0 ...">` block.

### Fragrance scene swaps
Current `FRAGRANCE_CARDS` contains shots that are visually about other categories (sunglasses appear in "Volcanic Sunset", sneaker appears in "Frozen Aura II"). Replace with verified clean fragrance previews from `custom_scenes` (category=fragrances):

Replace these entries:
- `Volcanic Sunset` → use the official fragrance preview ID `1775132683871-rw4rg7`
- `Frozen Aura` → use `1775136513431-i3rxtr`
- `Dynamic Water Splash` → use `1775132044712-m8fods`
- `Earthy Botanicals` → swap to `Earthy Driftwood Display` `1775136074748-fdv974`
- `Volcanic Sunset II` → swap to `Red Gradient Embrace` `1775132089419-eqo26l`
- `Frozen Aura II` → swap to `Earthy Glow Stage` `1775135707468-egh405`
- `Warm Neutral Studio` → swap to `Aquatic Reflection` `1775132826887-gjbnyl`

Keep working ones: `Motion Blur Float`, `Natural Light Backdrop`, `Near Face Hold`, `Dark Elegance`. New 12-card list:

```ts
const FRAGRANCE_CARDS: GridCardData[] = [
  { label: 'Original',                src: originalFragrance, isOriginal: true },
  { label: 'Volcanic Sunset',         src: PREVIEW('1775132683871-rw4rg7') },
  { label: 'Dynamic Water Splash',    src: PREVIEW('1775132044712-m8fods') },
  { label: 'Motion Blur Float',       src: PREVIEW('motion-blur-float-fragrance-1776013400244') },
  { label: 'Frozen Aura',             src: PREVIEW('1775136513431-i3rxtr') },
  { label: 'Natural Light Backdrop',  src: PREVIEW('1776018032748-kg4bn6') },
  { label: 'Earthy Driftwood',        src: PREVIEW('1775136074748-fdv974') },
  { label: 'Near Face Hold',          src: PREVIEW('near-face-hold-fragrance-1776013185169') },
  { label: 'Dark Elegance',           src: PREVIEW('1776018015756-3xfquh') },
  // hidden on mobile
  { label: 'Aquatic Reflection',      src: PREVIEW('1775132826887-gjbnyl') },
  { label: 'Red Gradient Embrace',    src: PREVIEW('1775132089419-eqo26l') },
  { label: 'Earthy Glow Stage',       src: PREVIEW('1775135707468-egh405') },
];
```

(Labels stay only in code/alt; users won't see them since titles are removed.)

---

## 3. `HomeTrustBlock.tsx` — minimalist rebuild

Replace the loud version with a clean, calm 3-column grid:
- Section bg: flat `bg-[#FAFAF8]`. Remove gradient blobs and amber/indigo glow decorations.
- Padding: `py-20 lg:py-28` (was `py-24 lg:py-40`).
- Header:
  - Eyebrow: `EARLY ACCESS`
  - H2: **"Early users are saying it works"** — `text-3xl sm:text-4xl`, no oversized 5xl.
  - Sub: **"A few notes from creators and brands testing VOVV right now."**
- Cards:
  - Plain white card, `rounded-2xl`, `border border-[#ececea]`, `p-7`. No gradient border, no hover lift.
  - No quote glyph icon. No star row. No colorful avatar gradients.
  - Quote text: `text-[15px] leading-relaxed text-foreground/80`.
  - Footer: tiny neutral grey monogram circle (`w-9 h-9 bg-[#f0efed] text-foreground/60`) + name + role; thin top-divider.
- Remove the stat chip row entirely.
- Keep one short disclaimer line under the grid: `Early-access feedback · Names anonymized.`
- **Rewrite quotes** so role matches what they're describing:
  1. *"I can test ten angles for one ring in minutes. It used to take a full afternoon to set up a single shoot."* — **M.L.**, Jewelry founder *(rings/jewelry — matches role)*
  2. *"Locking one visual direction across my skincare line keeps the catalog feeling like one brand."* — **D.K.**, Skincare brand owner
  3. *"I mock up entire campaign ideas before booking the real shoot. Saves a ton of back-and-forth."* — **A.R.**, Ecommerce photographer

---

## 4. `HomeOnBrand.tsx`
- Replace the `Radiant Glow Perfume` image:
  - From: `freestyle-images/.../91418be3-6c16-4573-b97b-8c757b37a792.png`
  - To: `product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776835737956-an8971.jpg`
- Update the label to a fitting name (e.g. `Amber Studio Frost`).

---

## Files
- edit `src/components/home/HomeCreateCards.tsx`
- edit `src/components/home/HomeTransformStrip.tsx`
- edit `src/components/home/HomeTrustBlock.tsx`
- edit `src/components/home/HomeOnBrand.tsx`
