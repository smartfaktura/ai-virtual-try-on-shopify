## Diagnosis

The event is now firing, but it is duplicated because `gtmBeginCheckout` currently sends the same `begin_checkout` twice:

1. `dataLayer.push({ event: 'begin_checkout', ... })`
2. `window.gtag('event', 'begin_checkout', ... )`

In this project, `gtag()` is defined as a wrapper around the same `dataLayer`:

```text
function gtag(){dataLayer.push(arguments);}
```

So the second call does not go somewhere separate. It pushes another `begin_checkout` into the same timeline. That matches the screenshot: two `begin_checkout` events appear back-to-back.

## Plan

1. Update `src/lib/gtm.ts`
   - Keep the canonical GTM event:
     ```text
     dataLayer.push({ event: 'begin_checkout', ecommerce: ... })
     ```
   - Remove the direct `window.gtag('event', 'begin_checkout', ...)` call from `gtmBeginCheckout`
   - Keep `{ ecommerce: null }` before the event so GA4 ecommerce data resets correctly
   - Keep the 10-second session deduplication for double-click protection

2. Leave checkout timing unchanged
   - The event should continue firing immediately before `create-checkout`, so it is captured before Stripe redirect

3. Clean debug logs
   - Update the debug output so it reports only the single canonical dataLayer event
   - Keep enough logging for future GTM preview checks when `vovv_gtm_debug` is enabled

4. Verify source count
   - Confirm only one app-side source emits `begin_checkout`: `gtmBeginCheckout`
   - Leave Meta Pixel `InitiateCheckout` untouched because that is a different Meta event, not GA4/GTM `begin_checkout`

## Expected result

On a single checkout click, Tag Assistant should show one `begin_checkout` event, not two. GTM tags can then be configured to fire from that single custom event.