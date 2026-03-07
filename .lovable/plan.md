

## Add ViewContent and InitiateCheckout Pixel Events

### Changes

**1. `src/lib/fbPixel.ts` — Add two new helper functions**
- `trackViewContent(contentName, contentType, value?)` — wraps `fbq('track', 'ViewContent', ...)`
- `trackInitiateCheckout(value?, currency?)` — wraps `fbq('track', 'InitiateCheckout', ...)`

**2. `src/contexts/CreditContext.tsx` — Fire InitiateCheckout in `startCheckout`**
- At the top of `startCheckout()` (line ~138), call `trackInitiateCheckout()` before invoking the edge function. This catches every checkout initiation from all surfaces (Settings, BuyCreditsModal, NoCreditsModal).

**3. `src/pages/Products.tsx` — Fire ViewContent when viewing products page**
- Add a `useEffect` that fires `trackViewContent('Products', 'product_library')` on mount.

**4. `src/pages/Settings.tsx` — Fire ViewContent on the billing/plans section**
- Add a `useEffect` that fires `trackViewContent('Pricing', 'pricing_page')` on mount.

**5. `src/pages/Pricing.tsx` — Fire ViewContent on the public pricing page**
- Add a `useEffect` that fires `trackViewContent('Pricing', 'pricing_page')` on mount.

### Files Changed
| File | Change |
|------|--------|
| `src/lib/fbPixel.ts` | Add `trackViewContent` and `trackInitiateCheckout` helpers |
| `src/contexts/CreditContext.tsx` | Fire `InitiateCheckout` in `startCheckout` |
| `src/pages/Products.tsx` | Fire `ViewContent` on mount |
| `src/pages/Settings.tsx` | Fire `ViewContent` on mount |
| `src/pages/Pricing.tsx` | Fire `ViewContent` on mount |

