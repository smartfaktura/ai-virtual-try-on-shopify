## Implementation plan (with the user's small adjustments folded in)

### 1. `src/lib/gtm.ts` — add `gtmBeginCheckout`, deprecate `gtmCheckoutStarted`

Replace the existing `gtmCheckoutStarted` block (lines 262–281) with a new `gtmBeginCheckout` helper that pushes the GA4-standard event name. Keep `gtmCheckoutStarted` exported as a deprecated thin wrapper so any lingering import doesn't break.

```ts
// ---------- 6. begin_checkout ----------
// Caller must invoke only AFTER create-checkout returns a Stripe session id
// (i.e. data.url + data.sessionId are both present). Never fire on modal open
// or button click. Dedup keyed by Stripe session id — same session never
// re-fires; a new session does.
export function gtmBeginCheckout(args: {
  userId: string;
  checkoutId: string;
  planName: string;
  value: number;          // already in major units (dollars/euros), not cents
  currency: string;       // will be uppercased
  pageLocation?: string;
}): void {
  const { userId, checkoutId, planName, value, currency, pageLocation } = args;
  if (!userId || !checkoutId) return;
  fireOncePersistent(`checkout:${checkoutId}`, {
    event: 'begin_checkout',
    user_id: userId,
    checkout_id: checkoutId,
    plan_name: planName,
    value,
    currency: upper(currency),
    page_location: pageLocation || (typeof window !== 'undefined' ? window.location.href : ''),
  });
}

/** @deprecated Use `gtmBeginCheckout` instead. Kept temporarily for backward compatibility. */
export function gtmCheckoutStarted(args: {
  userId: string;
  checkoutId: string;
  planName: string;
  value: number;
  currency: string;
}): void {
  gtmBeginCheckout(args);
}
```

### 2. `src/contexts/CreditContext.tsx` — fix `startCheckout` timing

- Remove `gtagBeginCheckout()` from line 194 (the premature push that creates the broken `begin_checkout` event with leaked modal fields).
- Remove the `gtagBeginCheckout` import.
- Keep `trackInitiateCheckout()` where it is (Meta Pixel — out of scope per user instructions). Add a TODO comment noting it currently fires too early and should be moved later.
- Replace `gtmCheckoutStarted({...})` call (lines 208–216) with `gtmBeginCheckout({...})` and add the debug log block.
- Default `planName`:
  - For `mode === 'payment'` (top-ups): `'Buy Credits'`.
  - For `mode === 'subscription'`: `'Unknown Subscription'` (NOT the user's current plan).
- `value: data.amount` — `create-checkout` already returns dollars (it divides `unit_amount/100`), so no further conversion.

```ts
const startCheckout = useCallback(async (priceId, mode, planName) => {
  trackInitiateCheckout(); // TODO: Meta Pixel fires too early — move after data.url returns in a follow-up.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    toast.error('Please log in to continue.');
    return;
  }
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { priceId, mode },
    });
    if (error) throw error;

    const resolvedPlanName =
      planName ||
      (mode === 'payment' ? 'Buy Credits' : 'Unknown Subscription');

    const willFire = !!user?.id && !!data?.url && !!data?.sessionId;
    if (typeof localStorage !== 'undefined' && localStorage.getItem('vovv_gtm_debug') === '1') {
      console.log('[GTM DEBUG begin_checkout]', {
        hasUser: !!user, userId: user?.id,
        hasUrl: !!data?.url, checkoutId: data?.sessionId,
        planName: resolvedPlanName,
        value: data?.amount, currency: data?.currency, willFire,
      });
    }

    if (data?.url) {
      if (willFire) {
        gtmBeginCheckout({
          userId: user!.id,
          checkoutId: data.sessionId,
          planName: resolvedPlanName,
          value: typeof data.amount === 'number' ? data.amount : 0,
          currency: data.currency || 'usd',
        });
      }
      window.location.href = data.url;
    }
  } catch (err) {
    console.error('Checkout error:', err);
    toast.error('Failed to start checkout. Please try again.');
  }
}, [user]);
```

### 3. Caller cleanup — pass accurate `planName`

- `src/components/app/UpgradePlanModal.tsx` lines 195 / 206 — already passes `selectedPlan.name` for subs; ensure top-up call (line 206) passes `\`${pack.credits} Credits\``.
- `src/pages/AppPricing.tsx` line 320 — pass `selectedPlan.name`.
- `src/components/app/UpgradeValueDrawer.tsx` line 95 — pass `plan.name`.
- `src/components/app/BuyCreditsModal.tsx` line 77 — pass `\`${pack.credits} Credits\``; line 116 already passes `selectedPlan.name`; line 132 (annual upgrade) — pass `currentPlanData.name`.
- `src/pages/Settings.tsx` line 376 — pass the selected plan name; line 394 — pass `\`${pack.credits} Credits\``.

### 4. Untouched (per user instructions)

- `pricing_modal_view` helper, payload, and dedup — unchanged.
- `pricing_page_view` — unchanged.
- `gtagPurchase` and `gtmSubscriptionPurchase` (post-payment) — unchanged.
- Meta Pixel `trackInitiateCheckout` and `trackPurchase` — unchanged (TODO comment added).
- GA4 gtag pageview — unchanged.

---

## Sample GTM Preview payloads after fix

**Open upgrade modal (no change):**
```json
{
  "event": "pricing_modal_view",
  "user_id": "8a1f…",
  "modal_name": "upgrade_plan",
  "source": "header_cta",
  "current_plan": "free",
  "page_location": "https://vovv.ai/app/generate/product-images"
}
```

**Click "Upgrade to Growth" → Stripe session created → just before redirect:**
```json
{
  "event": "begin_checkout",
  "user_id": "8a1f…",
  "checkout_id": "cs_test_a1B2c3D4…",
  "plan_name": "Growth",
  "value": 79,
  "currency": "EUR",
  "page_location": "https://vovv.ai/app/generate/product-images"
}
```

Cancelling Stripe and returning produces no purchase event and no re-fire of `begin_checkout` for the same `checkout_id` (`fireOncePersistent` keyed by `checkout:{sessionId}`). A fresh checkout produces a new `cs_…` session and fires once. Payment success continues to fire the existing `subscription_purchase` / `gtagPurchase` events with no changes.

---

## Files changed

- `src/lib/gtm.ts`
- `src/contexts/CreditContext.tsx`
- `src/components/app/UpgradePlanModal.tsx`
- `src/components/app/UpgradeValueDrawer.tsx`
- `src/components/app/BuyCreditsModal.tsx`
- `src/pages/AppPricing.tsx`
- `src/pages/Settings.tsx`

No DB / edge-function / RLS changes. No new secrets.