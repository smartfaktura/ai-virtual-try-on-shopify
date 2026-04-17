

## Goal
Mobile sticky bar on `/app/pricing`:
1. "Recommended" badge still doesn't fit next to the plan name on mobile.
2. Replace native `<select>` with a branded VOVV-style dropdown that opens **upward** with breathing space, shows each plan vertically with **price + credits per line**, and a Recommended marker on Growth.

## File
- `src/pages/AppPricing.tsx` (sticky bar block, lines 638–718)

## Changes

### 1. Custom branded dropdown (replace native `<select>`)
Replace both mobile and desktop `<select>` with a shadcn `Popover` (already part of the design system). Trigger = current plan name + chevron. Content = vertical list of plans, opens **upward** (`side="top"`, `align="start"`, `sideOffset={12}`) so it floats above the bar with breathing space.

Each row in the dropdown:
```
┌──────────────────────────────────────────┐
│  Growth              [Recommended]   ✓   │
│  $79/mo · 1,500 credits                  │
├──────────────────────────────────────────┤
│  Starter                                  │
│  $29/mo · 500 credits                    │
├──────────────────────────────────────────┤
│  Pro                                      │
│  $199/mo · 4,000 credits                 │
├──────────────────────────────────────────┤
│  Free                                     │
│  $0 · 30 credits/mo                      │
└──────────────────────────────────────────┘
```
- Plan name `text-sm font-semibold`, meta line `text-[12px] text-muted-foreground`.
- Selected row: subtle `bg-primary/5` + checkmark on right.
- Growth row: small "Recommended" pill (`text-[9px] uppercase` primary tint) inline next to name.
- Rounded corners, shadow-lg, `border-border/60`, `min-w-[260px]`, padding `p-1.5`.
- Animations: shadcn default fade+slide.

### 2. Mobile bar — fix "Recommended" overflow
Since the dropdown row itself shows the Recommended marker, **remove** the inline `REC` pill from the mobile trigger entirely. Trigger becomes just `Growth ⌄` — always fits.

To still surface the recommendation on the bar (without overflow), add a tiny "Recommended" indicator inline only when there's room — but on mobile, simpler: show a 6px primary dot before the plan name when `stickyPlanId === 'growth'` (no text → no overflow risk). The full "Recommended" pill lives in the dropdown.

Mobile result (390px):
```
┌──────────────────────────────────────────────┐
│ SELECTED PLAN                  [ Continue → ]│
│ • Growth ⌄                                   │
│ $79/mo · 1,500 credits                       │
└──────────────────────────────────────────────┘
```

### 3. Desktop bar
Keep the "Recommended" pill inline (already fits), but swap the native `<select>` for the same branded popover so behavior is consistent. Trigger = `Growth ⌄` button styled as ghost.

### 4. Trigger styling (both viewports)
Replace `<select>` with a `<button>`:
```tsx
<button className="flex items-center gap-1 -ml-1 px-1 py-0.5 rounded hover:bg-muted/60 transition-colors text-sm font-semibold">
  {stickyPlan.name}
  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
</button>
```

### 5. Keep
- Slide-up sticky animation, `pastCompare`/`atFinalCta` visibility logic, CTA button, mobile label shortener, width/positioning — all unchanged.

## Out of scope
- Comparison table, FAQ, How credits work, plan logic, billing flow.

## Result
- Mobile: no more truncation; "Recommended" indicated by small dot on bar and full pill in the dropdown.
- Branded vertical dropdown opens upward with breathing space, showing each plan with price + credits on its own line — easy to scan and select.
- Desktop and mobile share the same dropdown component for consistency.

