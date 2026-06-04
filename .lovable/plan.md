## Goal
Polish the Steal the Look preview modal (`DiscoverDetailModal`): remove the harsh white seam on the right panel and make open/close transitions smooth.

## Scope
Single file: `src/components/app/DiscoverDetailModal.tsx`. No data, routing, or admin logic changes.

## What's wrong today
1. The right side is `bg-background/95` with a visible `border-l border-border/20`, producing a hard vertical white edge next to the image area (the "strange white border").
2. Open animates via `animate-in fade-in duration-200`, but close instantly returns `null` — no exit transition. Result: pops away abruptly.

## Changes

1. **Smooth enter + exit**
   - Track `mounted` (controls portal presence) and `visible` (controls animation state) with `useState` + `useEffect` synced to the `open` prop.
   - On `open=true`: set `mounted=true`, then `requestAnimationFrame` → `visible=true`.
   - On `open=false`: set `visible=false`, then `setTimeout(220)` → `mounted=false`.
   - Use `data-state={visible ? 'open' : 'closed'}` on the root, backdrop, and panel; switch to Tailwind animation utilities:
     - Backdrop: `data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out duration-200`.
     - Right panel: same fade + `slide-in-from-right-4 / slide-out-to-right-4`.
     - Image side: `fade-in / fade-out` only (no slide).
   - Remove the existing one-shot `animate-in fade-in` from the root.
   - Keep Escape + body-scroll-lock effects; key them off `open` (existing).

2. **Remove the white seam**
   - Right panel: drop `border-l border-border/20`; use solid `bg-background` (no `/95`) so it reads as one surface, not a translucent strip over the dark backdrop.
   - Add a soft transition edge on the image side: a 24px wide gradient overlay on the inner right edge of the left column (`bg-gradient-to-r from-transparent to-background`) on `md:` and up only, so the image visually blends into the panel instead of butting against it.
   - Keep the panel background solid in both light and dark themes (uses the semantic token, no hex).

3. **Keep**
   - Portal, z-index, layout proportions (60/40 split), close button, all controls, related items, admin editor — untouched.

## Out of scope
SceneDetailModal, DiscoverCard, dashboard layout, taxonomy, RLS, DB.

## Risk
Low. Local presentation changes inside a single modal. No prop or API changes; consumers unaffected.