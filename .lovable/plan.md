

# Apple-Inspired Metric Cards Redesign

## Design Philosophy
Generous whitespace, large readable numbers, suffix text below the value (not beside it), no visible info icon by default — tooltip appears on card hover. Team avatar appears only inside the hover popover. Clean vertical stacking.

## Changes

### 1. `src/components/app/MetricCard.tsx` — Complete redesign

**Layout**: Vertical stack with generous padding (`p-6 sm:p-7`). No cramped horizontal layouts.

```text
┌─────────────────────────────┐
│                             │
│  € Cost Saved               │
│                             │
│  €2,640                     │
│  vs traditional photoshoots │
│                             │
│  ━━━━━━━━░░░ (if progress)  │
│                             │
│  [Continue →] (if action)   │
│                             │
└─────────────────────────────┘
```

Key changes:
- **Title row**: Icon + title only, no visible `(i)` icon. Remove the Info icon from default view entirely.
- **Value**: `text-2xl sm:text-3xl font-bold tracking-tight` — large, never truncated. Remove `truncate` class.
- **Suffix**: Rendered on its own line below the value as `text-xs text-muted-foreground mt-1` — not crammed inline. Full sentence visible ("vs traditional photoshoots", "no shooting or editing needed").
- **Description** (action cards): `text-sm sm:text-base font-medium` on its own line.
- **Action button**: Slightly larger `h-8 px-4 text-sm`.
- **Hover interaction**: On card hover, show a subtle bottom bar/popover with the team avatar + explainer. Use CSS group-hover to reveal a small branded footer strip inside the card:
  ```text
  ┌─────────────────────────────┐
  │  ...card content...         │
  │                             │
  │  [avatar] Omar · €30 avg   │  ← appears on hover
  │         per product photo   │
  └─────────────────────────────┘
  ```
  This replaces the popover entirely — the tooltip is now an inline reveal on hover using `opacity-0 group-hover:opacity-100 transition-opacity duration-300`.
- **Card container**: `group rounded-2xl border border-border/60 bg-card hover:border-border hover:shadow-md transition-all duration-300` — subtle border that strengthens on hover.
- **Loading state**: Match new padding.

### 2. `src/pages/Dashboard.tsx` (lines 494-543)

- Keep all 5 cards and their data as-is
- Change suffix text for clarity:
  - "vs photoshoots" → "vs traditional photoshoots"  
  - "no shooting needed" → "no shooting or editing needed"
- Ensure `toLocaleString()` on cost value so large numbers display properly

### Files
- `src/components/app/MetricCard.tsx` — full Apple-inspired redesign with hover-reveal branded footer
- `src/pages/Dashboard.tsx` — update suffix text for readability

