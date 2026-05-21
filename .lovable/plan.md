# Brand Models — clean mode chooser (VOVV style)

Strip the busy two-card layout. Match the rest of the app: light surface, minimal copy, no "Best for · …" microcopy, no chunky tinted icon tiles, no big headings competing with the page title.

## What changes

**File:** `src/pages/BrandModels.tsx` (chooser block only, lines ~905-950). Nothing else in the flow changes — reference path, manual path, consent, generation, edge function all stay as they are.

## New chooser

Remove the in-panel `<h2>How do you want to create this model?</h2>` and subtitle entirely. The page already has the title "New brand model" and the subtitle "Describe the person you want VOVV.AI to create" — a second heading is noise.

Render just two minimal options, centered, max-w-2xl:

```text
┌───────────────────────────┐  ┌───────────────────────────┐
│  Camera                   │  │  Wand                     │
│                           │  │                           │
│  Reference photo          │  │  Manual                   │
│  Re-photograph a person   │  │  Generate from scratch    │
└───────────────────────────┘  └───────────────────────────┘
```

Per card:
- `rounded-xl border border-border/50 bg-card p-5`
- hover: `hover:border-foreground/30` (no shadow, no scale)
- small 18px icon, `text-muted-foreground`, no tinted background tile
- title: `text-sm font-medium` (not `font-semibold text-base`)
- one-line description: `text-xs text-muted-foreground` — that's it
- no "Best for · …" line, no uppercase tracking-widest microcopy

Grid: `grid grid-cols-2 gap-3 max-w-2xl mx-auto`. Tighter than before.

## Copy (exact)

- Reference photo — "Re-photograph a real person from a photo."
- Manual — "Generate a new model from attributes."

No terminal periods if the rest of the app drops them (per core memory). Confirm against neighboring panels in this page and match.

## Out of scope

- Mode chooser only. Reference panel, manual panel, consent checkbox, double-confirm dialog, edge function, variation picker — all unchanged.
- No new components, no new icons.
