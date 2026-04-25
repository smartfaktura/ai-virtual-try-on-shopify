# Fix /home Transform Strip CTA buttons

## Problem

In `src/components/home/HomeTransformStrip.tsx` (the "35+ categories · 1000+ scenes · one upload" CTA block), the two buttons "Try it on my product" and "Browse the visual library" use a different styling pattern than the rest of `/home`:

- They use the shadcn `<Button asChild size="lg">` wrapper, while every other home section (Hero, Final CTA, Pricing teaser, How It Works, etc.) uses a raw `<Link>` with a fixed `h-[3.25rem]` pill style.
- This causes visible differences vs. the hero CTAs sitting just above (height, padding, weight, hover, shadow).
- The arrow on the primary but not the secondary looks accidental because the buttons themselves don't match the established pair pattern. In Hero and Final CTA the same arrow-only-on-primary pattern reads as intentional because both buttons share identical structure.

## Fix

Replace the two `<Button asChild>` elements in `HomeTransformStrip.tsx` (lines ~379–391) with the same raw `<Link>` pattern used in `HomeHero` and `HomeFinalCTA`:

```tsx
<div className="flex flex-col sm:flex-row gap-4 justify-center">
  <Link
    to="/auth"
    className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
  >
    Try it on my product
    <ArrowRight size={16} />
  </Link>
  <Link
    to="/product-visual-library"
    className="inline-flex items-center justify-center gap-2 h-[3.25rem] px-8 rounded-full border border-border text-foreground text-base font-semibold hover:bg-secondary transition-colors"
  >
    Browse the visual library
  </Link>
</div>
```

This guarantees:
- Identical height, padding, radius, font weight, and hover behavior on both buttons.
- Same casing convention as the rest of /home (sentence case: "Try it on my product" / "Browse the visual library" — matching "Try it on my product" / "See examples" in the Hero).
- The arrow-only-on-primary pattern now reads as intentional because both buttons share the same shape.

## Files

- `src/components/home/HomeTransformStrip.tsx` — replace the two `<Button asChild>` CTAs with raw `<Link>` elements matching the Hero/Final CTA pattern. Remove the now-unused `Button` import if no other usage remains in this file.

## Out of scope

No other home sections need changes — verified Hero, Final CTA, Pricing teaser, How It Works, Create Cards, Studio Team, and Environments all already use the consistent pill-link pattern.
