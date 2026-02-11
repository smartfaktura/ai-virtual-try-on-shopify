

## Fix Plans, Credits UX, Navigation Layout, and Button Styling

### Issues Found

1. **Navigation sidebar "2/20" layout** -- The balance number (2) and quota (/20) are in separate `<p>` tags, causing them to stack vertically. They should be on the same line for readability.

2. **"Upgrade Plan" and "Buy Credits" buttons don't match Generate button style** -- The insufficient credits buttons use `size="sm"` with `rounded-lg`, while the Generate button uses `size="lg"` with `rounded-xl`, `shadow-lg`, and `h-11`. They look out of place.

3. **Plan selection is mock/fake** -- `handlePlanSelect` in Settings.tsx just shows a toast ("Switched to X plan!") without actually updating the database. Same for `handleCreditPurchase` which calls `addCredits` (local state only, no DB write). These need to be honest about being placeholders until Stripe is connected.

4. **BuyCreditsModal "Buy" buttons also use local-only `addCredits`** -- No actual payment flow, just fake local credit additions.

### Changes

#### 1. Fix CreditIndicator layout (`src/components/app/CreditIndicator.tsx`)

Put balance and quota on the same line instead of stacked:

- Change from two separate `<p>` elements to a single line: `2 / 20`
- Keep the sparkle icon and overall compact layout

#### 2. Match insufficient credits buttons to Generate button style (`src/components/app/freestyle/FreestylePromptPanel.tsx`)

Update the "Upgrade Plan" and "Buy Credits" buttons to use the same styling as the Generate button:
- `size="lg"`, `h-11`, `rounded-xl`, `shadow-lg`
- Proper font weight and spacing
- The "Buy Credits" button becomes the primary CTA with amber styling matching the Generate button's prominence
- "Upgrade Plan" stays as outline but with matching size

#### 3. Make plan/credit actions honest placeholders (`src/pages/Settings.tsx`)

Since Stripe isn't connected yet:
- `handlePlanSelect`: Show a toast like "Payment integration coming soon" instead of pretending the plan changed
- `handleCreditPurchase`: Same -- show "Payment integration coming soon" instead of faking credit additions

#### 4. Fix BuyCreditsModal fake purchases (`src/components/app/BuyCreditsModal.tsx`)

- `handlePurchase`: Show "Payment coming soon" toast instead of silently adding fake credits
- `handleUpgrade`: Already navigates to settings, which is fine

### Technical Details

| File | Change |
|------|--------|
| `src/components/app/CreditIndicator.tsx` | Merge balance + quota into single inline element (e.g., `2 / 20`) |
| `src/components/app/freestyle/FreestylePromptPanel.tsx` | Update insufficient credits buttons to match Generate button sizing (`size="lg"`, `h-11`, `rounded-xl`, `shadow-lg`) |
| `src/pages/Settings.tsx` | Update `handlePlanSelect` and `handleCreditPurchase` to show "coming soon" toasts instead of fake success |
| `src/components/app/BuyCreditsModal.tsx` | Update `handlePurchase` to show "coming soon" toast instead of fake credit addition |

No database or backend changes needed.
