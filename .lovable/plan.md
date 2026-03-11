

## Add Google Ads Purchase Conversion Event

You already fire `gtagPurchase` (the GA4 `purchase` event) when a payment succeeds. The Google Ads conversion snippet from your screenshot needs the **same trigger point** — just a different event name: `ads_conversion_PURCHASE_1`.

### Changes

**`src/lib/gtag.ts`** — Add the Google Ads conversion call inside the existing `gtagPurchase` function, right after the GA4 purchase event:

```ts
export function gtagPurchase(value: number, currency = 'USD', transactionId?: string) {
  if (typeof window.gtag === 'function') {
    // GA4 purchase event
    window.gtag('event', 'purchase', {
      value,
      currency,
      ...(transactionId && { transaction_id: transactionId }),
    });
    // Google Ads conversion event
    window.gtag('event', 'ads_conversion_PURCHASE_1', {
      value,
      currency,
      ...(transactionId && { transaction_id: transactionId }),
    });
  }
}
```

No other files need changing — `gtagPurchase` is already called in `CreditContext.tsx` when `?payment=success` is detected with the amount.

