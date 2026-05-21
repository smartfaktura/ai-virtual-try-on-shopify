# Brand Models — clean mode chooser (VOVV style)

Drop the lucide camera/wand icons entirely. They cheapen the page. Use typography and a single quiet visual cue per card instead — the rest of the VOVV app does the same (Workflows, Library, Visual Studio cards rely on type and whitespace, not icon tiles).

## What changes

**File:** `src/pages/BrandModels.tsx`, chooser block only (~lines 905-950). Reference panel, manual panel, consent, double-confirm dialog, edge function — all untouched.

## New chooser — typographic, no icons

Remove the in-panel `<h2>How do you want to create this model?</h2>` and its subtitle. The page header already says it.

Two cards, equal weight, centered:

```text
┌─────────────────────────────┐  ┌─────────────────────────────┐
│ 01 / Reference              │  │ 02 / Manual                 │
│                             │  │                             │
│ Re-photograph a real        │  │ Generate a new model        │
│ person from a photo         │  │ from attributes             │
│                             │  │                             │
│                      Start →│  │                      Start →│
└─────────────────────────────┘  └─────────────────────────────┘
```

Per card:
- `rounded-2xl border border-border/50 bg-card p-8 min-h-[180px] flex flex-col justify-between`
- hover: `hover:border-foreground/40 transition-colors duration-200` — no shadow, no lift, no scale
- top-left eyebrow: `text-[10px] tracking-[0.2em] uppercase text-muted-foreground` — `01 / Reference`, `02 / Manual`
- title beneath (next visual line): `text-[15px] font-medium text-foreground leading-snug` — one short sentence, no period
- bottom-right: `text-xs text-muted-foreground group-hover:text-foreground` "Start →"
- No icons. No tinted background tile. No "Best for · …" line.

Grid: `grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto`.

## Copy (exact, no terminal periods per core memory)

- Eyebrow `01 / Reference` — title `Re-photograph a real person from a photo`
- Eyebrow `02 / Manual` — title `Generate a new model from attributes`

## Out of scope

Mode chooser only. Everything downstream (panels, consent, generation, variation picker) stays as-is.
