

## Add Google Analytics (gtag.js) Tracking

### Changes

**1. `index.html` — Add gtag.js snippet**
- Insert the Google tag script (G-ZLDDT9BMQF) in the `<head>`, alongside the existing Meta Pixel snippet.

**2. `src/lib/gtag.ts` — Create GA helper module**
- Mirror the `fbPixel.ts` pattern with typed helpers:
  - `gtagPageView()` — fires on SPA route changes
  - `gtagEvent(action, params)` — generic custom event
  - `gtagSignUp(method)` — sign_up event
  - `gtagPurchase(value, currency, transactionId?)` — purchase event
  - `gtagBeginCheckout(value?, currency?)` — begin_checkout event
  - `gtagViewItem(itemName, itemCategory, value?)` — view_item event

**3. `src/components/ScrollToTop.tsx` — Fire GA pageview on navigation**
- Call `gtagPageView()` alongside existing `trackPageView()`.

**4. `src/contexts/AuthContext.tsx` — Fire sign_up event**
- Call `gtagSignUp('email')` after successful signup, next to the existing `trackCompleteRegistration`.

**5. `src/contexts/CreditContext.tsx` — Fire begin_checkout and purchase events**
- In `startCheckout`: call `gtagBeginCheckout()` alongside `trackInitiateCheckout()`.
- In the payment success handler: call `gtagPurchase(value, 'USD')` alongside `trackPurchase()`.

**6. `src/pages/Products.tsx`, `src/pages/Pricing.tsx`, `src/pages/Settings.tsx` — Fire view_item events**
- Call `gtagViewItem()` alongside existing `trackViewContent()` calls.

### Files Changed
| File | Change |
|------|--------|
| `index.html` | Add gtag.js snippet |
| `src/lib/gtag.ts` | New — GA helper functions |
| `src/components/ScrollToTop.tsx` | Add GA pageview |
| `src/contexts/AuthContext.tsx` | Add GA sign_up event |
| `src/contexts/CreditContext.tsx` | Add GA checkout + purchase events |
| `src/pages/Products.tsx` | Add GA view_item event |
| `src/pages/Pricing.tsx` | Add GA view_item event |
| `src/pages/Settings.tsx` | Add GA view_item event |

