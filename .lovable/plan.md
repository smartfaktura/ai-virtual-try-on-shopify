## Goal

Make `/home` feel like one consistent page: same heading scale, same eyebrow style, same section rhythm, same CTA treatment across every section. Plus three small content edits (image swaps, hero Video card).

---

## 1. Typography & spacing audit — what's inconsistent today

Current mismatches across sections:

| Section | Heading size | Eyebrow | Subtitle color | Section padding |
|---|---|---|---|---|
| Hero | `text-[2.75rem] sm:text-5xl lg:text-[3.5rem]` | none | `text-muted-foreground` | `pt-28 pb-6 lg:pt-36 lg:pb-10` |
| TransformStrip | `text-3xl sm:text-4xl lg:text-5xl` | ✅ uppercase eyebrow | `text-muted-foreground` | `py-16 lg:py-32` |
| CreateCards | `text-3xl sm:text-4xl` (no `lg:`) | ❌ missing | `text-[#6b7280]` (hardcoded) | `py-16 lg:py-32` |
| HowItWorks | `text-3xl sm:text-4xl lg:text-5xl` | ✅ eyebrow | `text-muted-foreground` | `py-16 lg:py-32` |
| WhySwitch | `text-3xl sm:text-4xl` (no `lg:`) | ❌ missing | `text-[#9ca3af]` (hardcoded) | `py-16 lg:py-32` |
| OnBrand | `text-3xl sm:text-4xl` (no `lg:`) | ❌ missing | `text-[#6b7280]` (hardcoded) | `py-16 lg:py-32` |
| FAQ | `text-3xl sm:text-4xl` (no `lg:`) | ✅ eyebrow ("FAQ") | `text-[#6b7280]` | `py-16 lg:py-32` |
| FinalCTA | `text-3xl sm:text-4xl lg:text-5xl` | ❌ missing | `text-[#9ca3af]` | `py-16 lg:py-32` |

CTA buttons: hero, transform-strip, create-cards, how-it-works, final-CTA all use slightly different paddings/weights (`px-8` vs `px-10`, with/without `h-[3.25rem]`, with/without `font-semibold`).

---

## 2. Unification plan

**Heading scale (every H2):** `text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight`
**Eyebrow (every section, above H2):** `text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4`
**Subtitle:** `text-base sm:text-lg leading-relaxed` + per-section color token (white sections use `text-muted-foreground`, dark sections keep `text-[#9ca3af]`)
**Header block bottom margin:** `mb-12 lg:mb-16` everywhere
**Section padding:** keep `py-16 lg:py-32` everywhere (already consistent)
**Primary CTA:** `h-[3.25rem] px-8 rounded-full text-base font-semibold shadow-lg shadow-primary/25` everywhere

### Per-section copy/eyebrow additions

- **CreateCards** — eyebrow `What you can create` · keep H2 "What do you want to create first?"
- **WhySwitch** — eyebrow `Why VOVV` · keep H2
- **OnBrand** — eyebrow `Brand consistency` · keep H2
- **FinalCTA** — eyebrow `Get started` · keep H2

### Title polish (light pass for cohesion)

- HowItWorks H2: "From one photo to a full shoot" (drop "product")
- WhySwitch H2: "Replace slow content production"
- FAQ H2: "Common questions"
- FinalCTA subtitle: "Upload one photo. See what VOVV creates for your brand."

---

## 3. Three fragrance image swaps (HomeTransformStrip.tsx)

Map old IDs → new IDs in `FRAGRANCE_CARDS`:

| Card label | Old ID | New ID |
|---|---|---|
| Dark Elegance | `1775132826887-gjbnyl` | `1776018020221-aehe8n` |
| Volcanic Sunset | `1776018021309-gfgfci` | `repeated-shadow-grid-fragrance-1776013389735` |
| Natural Light Backdrop | `1776018032748-kg4bn6` | `1776018015756-3xfquh` |

Note: the new `1776018015756-3xfquh` ID is already used by the "Near Face Hold" card, and the desktop-only "Red Gradient Embrace" / "Earthy Glow Stage" tiles still reference the old IDs. To keep the grid duplicate-free, the desktop-only duplicates will be replaced with two unused fragrance IDs already present in the file (`1776018027926-ua03bd`, `near-face-hold-fragrance-1776013185169` rebalanced) so no tile repeats.

---

## 4. Add a Video card to hero row 1 (HomeHero.tsx)

Add a new card after "Original" using the existing `productVideoLoop` MP4 (`@/assets/home-create-product-videos.mp4`):

- Card type extended: `{ label, src, isOriginal?, isVideo? }`
- `MarqueeCard` renders `<video autoPlay loop muted playsInline>` when `isVideo`
- Label: `Video` with a small subtle "VIDEO" pill (matches "Original" pill style)
- Inserted at row1 position 1 so it appears in the first row
- `row2` slice indices adjusted so no card is lost

Result: hero row 1 becomes `Original · Video · Editorial · Studio · Lifestyle · Lookbook`.

---

## Files to edit

- `src/components/home/HomeHero.tsx` — add Video card + video support in `MarqueeCard`
- `src/components/home/HomeTransformStrip.tsx` — swap 3 fragrance IDs + dedupe
- `src/components/home/HomeCreateCards.tsx` — add eyebrow, unify H2 scale, unify CTA
- `src/components/home/HomeWhySwitch.tsx` — add eyebrow, unify H2 scale, polish copy
- `src/components/home/HomeOnBrand.tsx` — add eyebrow, unify H2 scale
- `src/components/home/HomeHowItWorks.tsx` — polish H2, unify CTA padding
- `src/components/home/HomeFAQ.tsx` — unify H2 scale, shorten title
- `src/components/home/HomeFinalCTA.tsx` — add eyebrow, unify CTA, polish subtitle

No new files, no DB or routing changes.

---

## Out of scope

Visual content of cards (photography itself), hero copy, navigation, footer.
