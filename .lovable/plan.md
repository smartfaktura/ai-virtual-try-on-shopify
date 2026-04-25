# Three small fixes: home button, category order, FAQ duplicate CTA

## 1. Home — "Browse the full scene library" button + subtext

`src/components/home/HomeEnvironments.tsx` — the button uses `h-[3rem] px-7 text-sm` and the subtext uses `text-xs text-muted-foreground`, which don't match the home button standard set in `HomeHero` (`h-[3.25rem] px-8 text-base font-semibold` with `shadow-lg`) or the eyebrow microcopy used elsewhere (`text-[11px] tracking-[0.12em] uppercase`).

Fix lines 13–22:

```tsx
<div className="flex flex-col items-center gap-4 pb-16 lg:pb-24 -mt-4">
  <Link
    to="/product-visual-library"
    className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-foreground text-background text-base font-semibold hover:bg-foreground/90 transition-colors shadow-lg shadow-foreground/10"
  >
    Browse the full scene library
    <ArrowRight size={16} />
  </Link>
  <p className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60 font-medium">
    1600+ scenes · 35+ categories
  </p>
</div>
```

This gives the button the same height, padding, font size, weight, and arrow size as the Hero CTAs, and converts the subtext to the same uppercase eyebrow style used under the Hero CTAs ("20 free credits · No credit card required") and the Transform Strip ("35+ categories · 1000+ scenes · one upload"). Casing stays sentence-case to match the rest of /home.

## 2. Built for every category — reorder tabs

`src/components/home/HomeTransformStrip.tsx` lines 119–126 — reorder `CATEGORIES` to the requested sequence:

```tsx
const CATEGORIES = [
  { id: 'watches',   label: 'Watches',   cards: WATCHES_CARDS },
  { id: 'swimwear',  label: 'Swimwear',  cards: SWIMWEAR_CARDS },
  { id: 'footwear',  label: 'Footwear',  cards: FOOTWEAR_CARDS },
  { id: 'jackets',   label: 'Jackets',   cards: JACKETS_CARDS },
  { id: 'eyewear',   label: 'Eyewear',   cards: EYEWEAR_CARDS },
  { id: 'fragrance', label: 'Fragrance', cards: FRAGRANCE_CARDS },
] as const;
```

Watches becomes the default opened tab. No card data changes.

## 3. FAQ page — remove duplicate end CTA

`src/pages/FAQ.tsx` ends with both `FAQContactStrip` ("Still have questions?") and `HomeFinalCTA` ("Try it on your product / Start free / See real examples"), saying essentially the same thing twice.

Keep `FAQContactStrip` (it's the right voice for an FAQ page) and drop `HomeFinalCTA`:

```tsx
<main>
  <FAQHero />
  <FAQAccordion />
  <FAQContactStrip />
</main>
```

Also remove the now-unused `import { HomeFinalCTA }` line at the top.

## Files

- `src/components/home/HomeEnvironments.tsx` — button + subtext styling
- `src/components/home/HomeTransformStrip.tsx` — reorder `CATEGORIES`
- `src/pages/FAQ.tsx` — drop duplicate `HomeFinalCTA` and its import
