

## Fix Settings Plan Card — Date Labels

Two bugs in the Current Plan card:

### Bug 1: Header says "Renews" for canceled subscription
Line 254 unconditionally shows "Renews Apr 17, 2026" for all non-free plans. When `subscriptionStatus === 'canceling'`, it should say "Access until Apr 17, 2026" instead.

### Bug 2: Redundant date crammed next to credits count
Lines 274-280 append `· ends Apr 17` or `· resets Apr 17` right next to the credits number (e.g., `500 / 500· ends Apr 17`). This is redundant since the date is already shown in the plan header line above. Remove this inline date entirely from the credits row — just show `500 / 500`.

### Changes (single file: `src/pages/Settings.tsx`)

1. **Line 254** — Add conditional: if `subscriptionStatus === 'canceling'`, show "Access until {date}" instead of "Renews {date}"

2. **Lines 272-281** — Simplify the credits row to just show the balance without the date suffix:
   ```
   <span className="text-sm font-semibold">{balance} / {creditsTotal === Infinity ? '∞' : creditsTotal}</span>
   ```
   Remove the `<span className="text-[10px]...">` element entirely.

