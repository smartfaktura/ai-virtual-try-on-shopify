# Remove two sections from the homepage

Remove the **Pricing** section and the **"Your Visuals. Updated Automatically."** (Creative Drops) section from the `/` landing page.

## Changes

Edit `src/pages/Landing.tsx`:

1. Delete `<Suspense fallback={null}><LandingPricing /></Suspense>` from the `<main>` block.
2. Delete `<Suspense fallback={null}><CreativeDropsSection /></Suspense>` from the `<main>` block.
3. Remove the now-unused `lazy()` imports for `LandingPricing` and `CreativeDropsSection` at the top of the file.

The section components (`LandingPricing.tsx`, `CreativeDropsSection.tsx`) stay on disk — they're still referenced from the Loading Lab / other landing pages and may be reused — they just no longer render on `/`.

## Resulting homepage order

Hero → Product Category → One Image to Visual Library → Studio Team → How It Works → Freestyle → Video → Model → Environment → FAQ → Final CTA → Footer.

## Files touched

- `src/pages/Landing.tsx` (only)
