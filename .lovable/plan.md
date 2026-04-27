Plan to fix `begin_checkout` so it appears in GTM Preview before Stripe opens

1. Confirm and keep the current event separation
- Keep `pricing_modal_view` unchanged and separate
- Do not restore the old premature `gtagBeginCheckout` event
- Do not add GTM triggers, Google Ads tags, or duplicate purchase tracking

2. Harden the `begin_checkout` call site in `CreditContext.tsx`
- Keep `gtmBeginCheckout` imported from `@/lib/gtm`
- Call it only after `create-checkout` returns successfully with both `data.url` and `data.sessionId`
- Add the requested debug log immediately after `create-checkout` returns:

```ts
console.log("[GTM DEBUG begin_checkout after create-checkout]", {
  hasUser: !!user,
  userId: user?.id,
  hasUrl: !!data?.url,
  checkoutId: data?.sessionId,
  planName,
  value: data?.amount,
  currency: data?.currency,
  dedupKey: data?.sessionId ? `gtm:checkout:${data.sessionId}` : null,
  dedupExists: data?.sessionId ? localStorage.getItem(`gtm:checkout:${data.sessionId}`) : null,
  willFire: !!user?.id && !!data?.url && !!data?.sessionId
});
```

- Wrap localStorage reads safely so tracking never breaks if storage is unavailable
- Pass `pageLocation: window.location.href` explicitly into `gtmBeginCheckout`
- Add `await new Promise(resolve => setTimeout(resolve, 300))` after `gtmBeginCheckout` and before `window.location.href = data.url`

3. Add payload-level logging inside `gtmBeginCheckout`
- Build the payload object before dedup
- When `vovv_gtm_debug === "1"`, log:

```ts
console.log("[GTM DEBUG gtmBeginCheckout payload]", payload);
```

- Also log if `gtmBeginCheckout` is blocked because `userId` or `checkoutId` is missing
- Keep the persistent dedup key as `gtm:checkout:{sessionId}` via `fireOncePersistent("checkout:{sessionId}", payload)`

4. Fix the remaining missing plan-name top-up call
- In `UpgradePlanModal`, change top-up checkout from:

```ts
startCheckout(pack.stripePriceId, 'payment')
```

to:

```ts
startCheckout(pack.stripePriceId, 'payment', `${pack.credits} Credits`)
```

- Existing plan-name sources remain:
  - `AppPricing`: `selectedPlan.name`
  - `UpgradeValueDrawer`: `plan.name`
  - `BuyCreditsModal`: `${pack.credits} Credits`
  - `Settings` top-up: `${pack.credits} Credits`

5. Verify the backend response contract
- `create-checkout` already returns:
  - `url: session.url`
  - `sessionId: session.id`
  - `amount: priceObj.unit_amount / 100`
  - `currency: priceObj.currency`
- No backend changes should be required unless testing shows one of these fields is missing

Expected flow after implementation

```text
Open upgrade modal
  -> pricing_modal_view dataLayer event

Click checkout
  -> create-checkout succeeds
  -> debug log shows hasUrl=true, checkoutId=cs_..., willFire=true
  -> begin_checkout dataLayer event is pushed
  -> 300ms pause
  -> redirect to Stripe

Cancel checkout
  -> no purchase event

Payment success
  -> existing purchase tracking only
```

Report after implementation
- Whether `gtmBeginCheckout` is imported in `CreditContext.tsx`
- Where it is called relative to `create-checkout`
- Whether `create-checkout` returns `sessionId`, `amount`, and `currency`
- Whether missing `sessionId`, missing `user.id`, dedup, or immediate redirect was the likely blocker
- Sample GTM Preview payloads for `pricing_modal_view` and `begin_checkout`