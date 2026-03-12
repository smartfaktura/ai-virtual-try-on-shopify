
Goal: make the Freestyle Studio demo controls always fit on small mobile widths (especially when both chips are active and button switches to “Generating…”), with no overflow or clipping.

What I found
- The mobile row is currently very tight: two active chips + generate button are all `shrink-0`.
- Width increases during animation because active chips use `scale-105` and the button uses `scale-[1.02]` + longer “Generating…” text.
- This causes the row to exceed narrow screen width and look oversized/not fitting.

Implementation plan (single file: `src/components/landing/FreestyleShowcaseSection.tsx`)
1. Add a true compact mobile control mode
- Extend each chip config with a short mobile label (e.g. `Top`, `Scene`).
- Render mobile labels when `isMobile` is true; keep full labels on desktop.
- Keep truncation but reduce mobile max text width slightly.

2. Stabilize row layout width
- Change control row to a mobile grid layout:
  - mobile: `grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]`
  - desktop: keep current inline flex behavior.
- Set chip wrappers to `min-w-0` so truncation always works inside grid columns.

3. Prevent animation-driven width growth on mobile
- Restrict scale animations to `sm:` and up:
  - chips: `sm:scale-105` only
  - button: `sm:scale-[1.02]` only
- This removes the “popping wider” behavior on small screens.

4. Make Generate button fixed/compact on mobile
- Give button a fixed mobile width (so state text changes never resize row).
- Use compact mobile state copy:
  - idle: `Generate` (or `Go`)
  - loading: `Gen…` (desktop keeps `Generating…`)
- Tighten mobile gap/padding inside button.

5. Keep typed prompt from contributing to crowding
- Enforce single-line clipping in prompt text on mobile (`whitespace-nowrap overflow-hidden text-ellipsis`) while keeping full multiline behavior on desktop.

Validation checklist
- Test at 320px, 375px, and 390px widths.
- Verify row fits in all animation states:
  - before chips active
  - both chips active
  - generating state (spinner + text)
- Confirm no horizontal overflow, no clipping, no line hopping.
