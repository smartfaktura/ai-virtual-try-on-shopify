

## Show out-of-credits banner when balance < 4

### Change in `src/pages/Dashboard.tsx`
Update the hero condition that currently renders only when `isEmpty` (balance === 0) to also render when balance is below 4.

- Replace `{isEmpty ? (...banner...) : (...balance line...)}` with: render banner when `isEmpty || balance < 4`, otherwise render nothing (per previous decision to drop the inline `{balance} credits available` line).
- Banner copy stays dynamic:
  - `isEmpty` → title "You're out of credits", body "Get credits to start creating", CTA "Get Credits"
  - `balance < 4` (not empty) → title "Running low on credits", body `Only ${balance} credits left — top up to avoid interruptions`, CTA "Get Credits"
- Same styling, same position (right after subtitle), same `openBuyModal` action.

### Acceptance
- Balance 0 → banner shown ("out of credits" copy)
- Balance 1–3 → banner shown ("running low" copy)
- Balance ≥ 4 → no banner, clean hero
- No other dashboard sections touched

