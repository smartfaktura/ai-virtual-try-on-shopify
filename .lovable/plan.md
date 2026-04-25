The current hero feels cramped and amateur. The 2×2 collage on the right is small and one tile is broken. I'll redo it from scratch with a spacious, editorial layout.

## Two real bugs first

1. **Broken image** in the footwear hero: `night-curb-flash-1776011807130` is stored as `.png`, but the `PREVIEW()` helper hardcodes `.jpg`. Fix `PREVIEW()` to use a small lookup of known PNG IDs (5 IDs total) and default to `.jpg` for everything else.
2. The first tile shows raw alt text — same root cause as #1.

## New hero design (rebuild `CategoryHero.tsx`)

Replace the cramped 50/50 grid + 2×2 collage with a **full-bleed editorial split** inspired by premium DTC sites (Aesop, Glossier, Loewe):

```text
┌─────────────────────────────────────────────────────────────────┐
│   FOOTWEAR · SNEAKERS · BOOTS                                    │
│                                                                  │
│   AI Product                          ┌───────┐ ┌───────┐        │
│   Photography                         │       │ │       │        │
│   for Footwear Brands                 │ tile1 │ │ tile2 │        │
│                                       │       │ │       │        │
│   Upload one shoe photo and create…   └───────┘ └───────┘        │
│                                       ┌───────┐ ┌───────┐        │
│   [ Create your first visuals free ]  │       │ │       │        │
│   [ See examples ]                    │ tile3 │ │ tile4 │        │
│                                       │       │ │       │        │
│   Free to start · No credit card req. └───────┘ └───────┘        │
└─────────────────────────────────────────────────────────────────┘
```

Key changes:

- **Wider canvas**: bump container from `max-w-[1200px]` → `max-w-[1320px]`. Use `px-8 lg:px-12`.
- **Asymmetric grid**: copy column ~`5fr`, image column ~`6fr` (image gets MORE room, not less). `gap-12 lg:gap-20`.
- **Generous vertical breathing**: `py-16 lg:py-24` (vs current `pt-8 pb-16`). H1 → eyebrow gap `mb-5`, H1 → sub `mb-7`, sub → CTA `mb-9`.
- **Bigger H1**: `text-[2.5rem] sm:text-[3.25rem] lg:text-[3.75rem]`, leading `1.05`.
- **Drop the dark border-frame around the collage** — remove the shadowed `rounded-3xl` wrapper. Tiles float free.
- **2×2 individual tiles**, each `aspect-[4/5]`, `rounded-2xl`, `gap-3 lg:gap-4`. Slight stagger using `lg:translate-y-*` on cols (subtle editorial feel: even col shifted down 24px).
- **Smaller, lowercase chip overlays** (`bg-background/90 backdrop-blur text-[10px] tracking-[0.14em] uppercase font-medium`) at bottom-left of each tile — kept tasteful.
- **Image rendering**: `loading="eager"` only on first 2 tiles (LCP); `fetchpriority="high"` only on first. Quality 70.
- **Decorative grain**: very subtle dotted radial via SVG bg in the section, opacity 0.04 — adds depth without noise.
- **Mobile**: copy stacks above a 2×2 collage at full width with `aspect-square` tiles.

## Why this fixes the issues

- "Not spacious" → wider container + larger paddings + image side gets more space + larger H1.
- "Looks bad / cramped" → removing the dark rounded frame around tiles lets the images breathe; staggered offset adds editorial polish.
- "Broken image" → PREVIEW helper now resolves the correct extension.

Files touched:
- `src/data/aiProductPhotographyCategoryPages.ts` (PREVIEW helper)
- `src/components/seo/photography/category/CategoryHero.tsx` (full rebuild)

Applies to all 10 category pages automatically.
