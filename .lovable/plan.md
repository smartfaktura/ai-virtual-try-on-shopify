

## Install Facebook Pixel with Purchase Event Tracking

### Overview
Add the Meta Pixel (ID: `1556554718768756` from your screenshot) to track page views globally and fire `Purchase` events with dollar values when users return from successful Stripe checkouts.

### Changes

**1. Add Pixel base code to `index.html`**
- Insert the standard Meta Pixel snippet in `<head>` with your pixel ID `1556554718768756`
- This fires `PageView` on every page load automatically

**2. Create `src/lib/fbPixel.ts` helper**
- Thin wrapper around `window.fbq` with TypeScript typing
- Export `trackPurchase(value: number, currency: string)` that calls `fbq('track', 'Purchase', { value, currency })`
- Export `trackPageView()` for SPA route changes

**3. Fire `PageView` on route changes in `src/components/ScrollToTop.tsx`**
- Call `trackPageView()` alongside the existing scroll logic so every SPA navigation sends a PageView event

**4. Fire `Purchase` event in `src/contexts/CreditContext.tsx`**
- In the `payment=success` handler (line ~187), determine the purchased item from URL or stored state
- Call `trackPurchase(value, 'USD')` with the correct dollar amount
- To pass the value through the checkout flow, add it as a query param in the `success_url` in `create-checkout` edge function: `?payment=success&amount={price}`

**5. Update `supabase/functions/create-checkout/index.ts`**
- Look up the price amount from the Stripe price object and append `&amount=XX` to the success URL so the frontend knows the purchase value

### Purchase Values Tracked

| Item | Value |
|------|-------|
| Starter Monthly | $39 |
| Starter Annual | $372 |
| Growth Monthly | $79 |
| Growth Annual | $756 |
| Pro Monthly | $179 |
| Pro Annual | $1716 |
| 200 Credits Pack | $15 |
| 500 Credits Pack | $29 |
| 1500 Credits Pack | $69 |

### Files Changed
| File | Change |
|------|--------|
| `index.html` | Add Meta Pixel base script |
| `src/lib/fbPixel.ts` | New — typed fbq helpers |
| `src/components/ScrollToTop.tsx` | Fire PageView on route change |
| `src/contexts/CreditContext.tsx` | Fire Purchase event on payment success |
| `supabase/functions/create-checkout/index.ts` | Pass amount in success URL |

