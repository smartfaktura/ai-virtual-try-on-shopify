I found the important part: the backend checkout is working. Recent `create-checkout` logs show real Stripe sessions being created, so the button flow reaches checkout successfully.

The weak point is the current tracking placement: `begin_checkout` only fires after the backend returns a Stripe session id, immediately before `window.location.href = Stripe URL`. That makes the event dependent on the final redirect moment. Since Tag Assistant is still not showing it, the fix should not be more delay — it should fire the GTM event at the exact moment checkout starts, before the backend call and before any redirect can tear down the page.

Plan:

1. Update the GTM helper to support a real checkout-start event
   - Fire `begin_checkout` immediately when `startCheckout(...)` begins
   - Do not require `checkoutId` for this event, because the Stripe session does not exist yet
   - Include standard ecommerce structure so GTM/GA4 recognizes it reliably:
     ```ts
     dataLayer.push({ ecommerce: null });
     dataLayer.push({
       event: 'begin_checkout',
       ecommerce: {
         currency: 'USD',
         value: 79,
         items: [{ item_name: 'Growth', price: 79, quantity: 1 }]
       },
       plan_name: 'Growth',
       checkout_mode: 'subscription',
       page_location: window.location.href
     });
     ```

2. Move `begin_checkout` firing to the start of `CreditContext.startCheckout`
   - This centralizes the fix for all entry points:
     - pricing modal
     - in-app pricing page
     - settings pricing cards
     - top-up credits
     - upgrade drawer
   - This avoids patching each button separately

3. Keep Stripe-session tracking separate
   - After `create-checkout` returns, keep using the Stripe `sessionId` for redirect/purchase attribution
   - Do not fire a second `begin_checkout` after the backend returns, to avoid duplicates
   - Optionally push a different debug/custom event like `checkout_session_created` only if GTM debug is enabled, not as a marketing conversion event

4. Add safer deduping
   - Deduplicate checkout-start by short session window, e.g. plan + mode + page for ~10 seconds
   - This prevents double-click duplicates but still allows a new attempt if the user retries

5. Improve debug visibility
   - When `localStorage.setItem('vovv_gtm_debug','1')` is enabled, log:
     - `begin_checkout` fired before backend call
     - `dataLayer` length before/after
     - whether GTM/gtag are available
     - whether checkout redirect starts

Expected result:
- In GTM Preview, `begin_checkout` should appear immediately after clicking “Continue to checkout”, before the Stripe redirect.
- This is independent of redirect timing and independent of Stripe session creation latency.
- No database changes are needed.