

# Fix Modal Background Uniformity

## Root Cause
The `DialogContent` base component applies `bg-background` (white). The override `bg-muted/50` is only 50% opacity of the muted color — barely visible, creating an inconsistent look where the header area appears white-ish while cards sit on a slightly gray tone.

## Fix

### Both `NoCreditsModal.tsx` and `BuyCreditsModal.tsx`
- Change `bg-muted/50` to `bg-muted` (full opacity) on the `DialogContent` wrapper — this ensures the entire popup has one uniform gray background from edge to edge
- The white `bg-card` plan cards will contrast cleanly against the solid muted background

### Files
- `src/components/app/BuyCreditsModal.tsx` — line 130: `bg-muted/50` → `bg-muted`
- `src/components/app/NoCreditsModal.tsx` — line 403: `bg-muted/50` → `bg-muted`

