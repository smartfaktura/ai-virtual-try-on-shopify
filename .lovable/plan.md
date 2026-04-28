## Goal

Fully remove Meta Pixel from the website/app code. After this change, **all Meta tracking will fire exclusively from GTM** (using the existing dataLayer events: `page_view`, `begin_checkout`, `purchase`, etc.). Google Ads, GA4, GTM, and dataLayer pushes remain untouched.

## Files to change

### 1. `index.html` — remove Meta Pixel base + PageView + noscript fallback
- Remove the entire `<!-- Meta Pixel Code - deferred -->` block (lines ~48–61): the IIFE loader, `fbq('init', '1556554718768756')`, and `fbq('track', 'PageView')`.
- Remove the `<link rel="dns-prefetch" href="https://connect.facebook.net" />` line (no longer needed).
- Remove the `<noscript><img ... facebook.com/tr?id=...&ev=PageView&noscript=1 /></noscript>` fallback in `<body>`.
- Keep: GTM script + GTM `<noscript>` iframe, gtag.js, all social profile links (`facebook.com/vovvaistudio`) — those are just brand links, not tracking.

### 2. `src/lib/fbPixel.ts` — delete file
The whole helper module is removed (`trackPageView`, `trackPurchase`, `trackViewContent`, `trackInitiateCheckout`, `trackCompleteRegistration` and the `window.fbq` global declaration).

### 3. Remove all imports + call sites of the deleted helpers

| File | Remove |
|---|---|
| `src/components/ScrollToTop.tsx` | `import { trackPageView } from '@/lib/fbPixel'` and the `trackPageView()` call. Keep `gtagPageView()`. |
| `src/contexts/AuthContext.tsx` | `import { trackCompleteRegistration } from '@/lib/fbPixel'` and the `trackCompleteRegistration('email')` call. |
| `src/contexts/CreditContext.tsx` | `import { trackInitiateCheckout } from '@/lib/fbPixel'` and the `trackInitiateCheckout()` call. The `dataLayer.push({ event: 'begin_checkout', ... })` stays — GTM uses it to fire Meta InitiateCheckout. |
| `src/pages/Pricing.tsx` | `import { trackViewContent } from '@/lib/fbPixel'` and the `trackViewContent('Pricing', 'pricing_page')` call. |
| `src/pages/Products.tsx` | Remove the `trackViewContent` import and call; keep `gtagViewItem(...)`. |
| `src/pages/Settings.tsx` | Remove the `trackViewContent` import and call; keep `gtagViewItem(...)`. |

### 4. Old URL-only Meta Purchase
Confirmed there is **no** code that fires a Meta Purchase based on a `payment=success` URL or any other URL pattern (`trackPurchase` is defined in `fbPixel.ts` but never called anywhere). Deleting `fbPixel.ts` removes it entirely.

## After the change

- `window.fbq` will be `undefined` (no base script loaded).
- No requests to `connect.facebook.net/en_US/fbevents.js` or `facebook.com/tr`.
- GTM container continues to receive `page_view`, `begin_checkout` (with `checkout_id`), `purchase` (with `transaction_id`, `value`, `currency`), etc. → Meta tags inside GTM trigger from there.
- TypeScript build clean (no dangling imports of `@/lib/fbPixel`).

## Reporting back (after implementation)

I will report:
- Files where Meta Pixel was removed (the 8 files above).
- A repo-wide grep confirming **0** remaining matches for `fbq`, `fbPixel`, `fbevents`, `connect.facebook.net`, `trackPurchase`, `trackInitiateCheckout`, `trackViewContent`, `trackCompleteRegistration`, `trackPageView`, and the pixel ID `1556554718768756`.
- Confirmation that no URL-based Meta Purchase trigger exists in code (it never did — only the unused `trackPurchase` helper, now deleted).