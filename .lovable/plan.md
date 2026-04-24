## Problem
The current "How it works" section mixes two visual languages:
- Step 1 looks broken (faint grayscale image + tiny floating upload icon).
- Steps 2 & 3 use real high-resolution lifestyle photos (women in dresses, fragrance bottles, swimwear models) which clash with the wireframe-mock aesthetic the section is supposed to convey.
- The reference mock (uploaded earlier) is a clean, neutral wireframe — not a showcase of real outputs.

## Fix — rewrite all 3 step visuals as consistent neutral wireframes

Edit `src/components/home/HomeHowItWorks.tsx`. Drop the `PREVIEW`/Supabase image imports and the `getOptimizedUrl` import. All visuals become CSS-only wireframes.

### Step 1 — Upload
Card containing a single rounded "product placeholder" tile that fills ~70% of the card:
- Soft neutral background (`bg-muted/50`)
- Generic product silhouette: a rounded-rect bottle shape rendered as a centered SVG/div in a slightly darker neutral (`bg-foreground/10`)
- Dashed border around the tile (`border-2 border-dashed border-border`)
- A small white circular badge with the `Upload` icon overlaid bottom-center on the tile

### Step 2 — Choose shots
- Top row: small `1000+ SHOTS` chip (existing) + faux search bar (existing)
- 2×2 grid of **wireframe thumbnails** — each is a `bg-muted/40` rounded tile containing a centered generic "image" glyph (small mountain + sun SVG icon in `text-muted-foreground/40`), exactly like the reference mock
- No real photos

### Step 3 — Generate
- 3 stacked rows, each with a small wireframe thumbnail (same `bg-muted/40` + image glyph) on the left and 2 grey text bars on the right
- No real photos

### Shared "ImagePlaceholder" sub-component
Create one small inline component returning the neutral tile + image glyph; reuse in steps 2 & 3.

### Other tweaks
- Cards: keep `aspect-[4/5]` / rounded-3xl / white bg / soft border — already good
- Remove `STEP1_ORIGINAL`, `STEP2_THUMBS`, `STEP3_THUMBS`, `PREVIEW`, `SUPABASE_PUBLIC`, `getOptimizedUrl`, `originalFragrance` import
- Keep header, arrows, CTA exactly as they are

## Files
- edit `src/components/home/HomeHowItWorks.tsx`
