## Changes

### 1. Hide support chat on /app/video/start-end
In `StartEndVideo.tsx`, add a `useEffect` that sets `document.body.setAttribute('data-hide-studio-chat', 'true')` on mount and removes it on unmount — same pattern already used in `ProductSwap.tsx`.

### 2. Simplify "Not enough credits" message + fix mobile layout
Both `StartEndVideo.tsx` (line ~394) and `AnimateVideo.tsx` (line ~1356) currently render the long sentence "Not enough credits — you need X, you have Y" inline next to the cost pill, which wraps badly on mobile.

- Replace the long sentence with a short pill: `Not enough credits` rendered as a `rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-[11px] font-medium text-destructive` chip.
- On mobile, ensure the chip sits on its own line under the cost pill (the parent row is already `flex-col sm:flex-row`, so the inner wrapper `flex items-center gap-2 flex-1 flex-wrap` keeps it tidy; the shorter pill will no longer overflow).

### 3. Round motion tiles further
In `CameraMotionGrid.tsx` line 94, bump tile radius `rounded-2xl` → `rounded-3xl` for the recommended motion selection cards.

## Notes
- Purely visual/UX adjustments — no logic or backend changes.
- Uses existing `destructive` semantic token from the design system.