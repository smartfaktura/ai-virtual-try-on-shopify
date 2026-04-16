

# Fix /app/pricing Spacing, Consistency & Credit Copy

## Problem
- Inconsistent container widths across sections (some `max-w-3xl`, some `max-w-5xl`, features use full width) — feels disjointed when scrolling
- Section spacing is too tight (`space-y-16` between major sections, inner gaps `space-y-4`/`space-y-6`)
- Credit copy says "5 credits per image" — should be "4–6 credits per image based on workflow"

## Changes

### 1. Unify container width
- Wrap all content sections in a consistent `max-w-5xl` outer container (already set on line 114)
- Remove the `max-w-3xl` constraint on the team comparison table and value-at-a-glance table — let them breathe within the `max-w-5xl` parent
- FAQ section: widen from `max-w-2xl` to `max-w-3xl`

### 2. Increase section spacing
- Change outer `space-y-16` → `space-y-24` for breathing room between major sections
- Change inner section header gaps from `space-y-2` → `space-y-3`
- Add `pt-4` below billing toggle area for more hero breathing room

### 3. Fix credit cost copy
- "How credits work" first card: change "5 credits per image" → "4–6 credits per image depending on the workflow and model selection"
- FAQ last item: change "Each image generation costs 5 credits" → "Each image costs 4–6 credits depending on workflow — Freestyle starts at 4, Visual Studio scenes cost 6"
- Value table `~Images` column: update estimates to use 5 as average (keep as-is, it's approximate)

### 4. Minor polish
- Add `pb-8` at the bottom of the page for scroll end padding

## Files
- `src/pages/AppPricing.tsx` — spacing, width, and copy updates (no logic changes)

