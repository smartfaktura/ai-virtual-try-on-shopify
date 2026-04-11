

# Sidebar Spacing Refinements

Looking at the current sidebar layout against design best practices, here are the issues and fixes:

## Current Issues

1. **Too much top padding** above "Create Visuals" button (`pt-5`) — pushes content down unnecessarily
2. **Separator line + nav top padding create double-spacing** — the nav has `py-4` plus the separator has `mb-2`, making the gap between the CTA button and "Dashboard" feel too loose
3. **Nav item vertical spacing (`space-y-1`)** is fine but the overall nav section padding is generous — items could sit slightly tighter
4. **Credit section and user profile** both have `border-t` separators with their own padding — this is good, no change needed

## Proposed Fixes (file: `src/components/app/AppShell.tsx`)

| Area | Current | Proposed | Why |
|------|---------|----------|-----|
| CTA top padding | `pt-5 pb-2` | `pt-4 pb-1` | Tighten logo-to-CTA gap |
| Nav section padding | `py-4` | `pt-3 pb-4` | Reduce CTA-to-nav gap |
| Separator margin | `mb-2` | `mb-1` | Less dead space before first item |

These are subtle 4-8px reductions that tighten the vertical rhythm without making it feel cramped, keeping the nav items closer to the action button and giving more room for the list itself.

## Files Changed
1. `src/components/app/AppShell.tsx` — adjust padding values on CTA wrapper, nav section, and separator

