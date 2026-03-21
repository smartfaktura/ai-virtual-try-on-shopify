

# Improve TryShot Hero Headline

## Problem
The grey `text-muted-foreground` (muted blue-grey at 47% lightness) paired with `text-primary` (very dark navy at 17% lightness) creates an awkward contrast — the grey feels washed out while the navy is too dark, making them clash rather than complement.

## Proposal: All-dark heading with the rotating word as the accent color

Make the entire heading dark (`text-foreground` — the near-black navy used site-wide) and make **only the rotating word** use a brighter, more vivid blue accent. This creates a clean "black text with one colored word" effect — similar to how Stripe, Linear, and Vercel handle hero headlines.

### File: `src/pages/TryShot.tsx`

**Line 143 — Heading**: Change `text-muted-foreground` → `text-foreground`. Keep `font-medium`.

**Line 147 — Rotating word span**: Change `text-primary font-bold` → a richer blue that pops against the dark heading. Use an inline style with a more vivid blue (`hsl(217, 60%, 35%)`) or add a custom utility. This is brighter than the current `primary` (which is essentially black-navy) while staying on-brand.

```tsx
<h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-medium tracking-tight leading-[1.1] mb-6 text-foreground">
  Product shots
  <br />
  for{' '}
  <span className="font-bold" style={{ color: 'hsl(217, 60%, 35%)' }}>
    {displayWord}
    <span className="animate-pulse">|</span>
  </span>
</h1>
```

The result: clean dark heading with a rich royal blue accent word — high contrast, editorial, no grey.

