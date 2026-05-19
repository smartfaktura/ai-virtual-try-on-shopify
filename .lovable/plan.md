## Goals

Bring `/app/models` and `/app/models/new` up to the platform's premium aesthetic. Fix oversized cards on the grid, fix the mismatched back link + flat form on the wizard.

## /app/models — grid polish

- **Tighter density**: grid becomes `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3` (currently maxes at 4 cols and `gap-4`) — cards visually smaller and more refined on wide screens.
- **Card refinement** (`ModelCard`):
  - Drop the always-on "BRAND MODEL" badge on the image — feels noisy on a page already titled Brand Models
  - Trim card padding `p-3` → `p-2.5`, name to `text-[13px]`, chips to `text-[10px]` with lighter `bg-muted/40` borderless pill style
  - Show only 2 chips max (gender · ethnicity); hide age if absent
  - Hover CTA pill: smaller (`text-[10px]`, `py-1.5`), more subtle background, single arrow
  - Delete button stays top-right, smaller icon
- **Dashed "New model" tile**: same height as cards (already aspect-[3/4]), thinner border, smaller `+` icon, label `text-[11px]`, removed extra padding chunk

## /app/models/new — premium wizard

- **Replace custom back link with `PageHeader` + `backAction`** — same component used by Catalog Studio / Add Product, guarantees visual consistency. Title `Create New Model`, subtitle `Describe your ideal model · 20 credits per generation`. Drops the Sparkles icon (PageHeader doesn't carry icons elsewhere).
- **Wider, segmented form layout** (still single-scroll, no tabs):
  - Container: `max-w-3xl` (was `max-w-2xl`) — more breathing room
  - Replace one big `Card` wrapping everything with **three stacked section cards**: `Essentials`, `Appearance`, `Reference (optional)` — each card has a small uppercase section label header + thin divider, matching the platform's section rhythm
  - Inside each card: same fields, but tighter vertical spacing (`space-y-4` not `space-y-5`), grid for Essentials (gender + age in one row on desktop, ethnicity + morphology in another)
  - Section dividers visually separate without nesting noise
- **Sticky bottom action bar** (replacing inline Generate button at the end of the form):
  - Pinned at the bottom of the viewport with `sticky bottom-0`, subtle top border + blurred background
  - Left: credit cost + balance (red if low)
  - Right: `Cancel` (ghost) + `Generate Brand Model` (primary)
  - Mirrors the look of existing wizard footers (Catalog Studio, AddProduct)
- **Move admin "Make Public" toggle** into the sticky bar as a small switch on the left so it doesn't break the form rhythm (admin only).

## Implementation

To avoid a heavy refactor of `UnifiedGenerator`, I'll:
1. Keep `UnifiedGenerator` as-is for the generation logic + variation picker + loading state
2. Add an **optional `layout?: 'card' | 'sections'` prop** (default `card`) that, when set to `sections`, renders the form across the 3 section cards instead of one big card, and renders the sticky bar at the bottom
3. `BrandModelNew.tsx` uses `<UnifiedGenerator layout="sections" ... />` wrapped in `PageHeader`

## Files

- `src/pages/BrandModels.tsx` — refine `ModelCard` (no top badge, smaller chips, tighter spacing, hover pill polish), tighten grid columns/gap, refine dashed tile, add `layout` prop to `UnifiedGenerator` and restructure form rendering into Essentials / Appearance / Reference section cards + sticky footer when `layout === 'sections'`
- `src/pages/BrandModelNew.tsx` — swap custom back link for `PageHeader` w/ `backAction`, drop the wrapping Card, render `<UnifiedGenerator layout="sections" />`

## Out of scope

- No backend / edge function changes
- No live preview card (still a follow-up if you want it)
- No mobile-specific reflow beyond what Tailwind classes give us
