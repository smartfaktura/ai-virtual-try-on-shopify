## Lighten the "Brand Models" CTA card

Make the model-showcase CTA feel airier and more legible:

- **Card body**: switch from solid dark `bg-foreground text-background` to a light `bg-background` with a hairline `border border-foreground/10` (hover deepens to `foreground/25`). Removes the heavy block.
- **Plus icon ring**: thin `border-foreground/20`, icon `text-foreground/80`.
- **"BRAND MODELS" wordmark**: uses `text-foreground` (was muted background tone — that was the hard-to-read one).
- **"Create your own"**: bumped from `text-background/55 font-light` to `text-foreground/70 font-medium` — readable but still secondary.
- **"Custom" caption below card**: drop the italic; use `text-muted-foreground` (slightly stronger than the previous `/70 italic`) so it matches the model name labels (Tyler, Nia, etc.).

One file edit: `src/components/landing/ModelShowcaseSection.tsx`, only the `BrandModelCTA` component (lines 20–36). No other components touched.

**Approve to apply.**