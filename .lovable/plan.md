# Add `pricing_modal_view` GTM event (with safety adjustments)

Track in-app pricing/upgrade/buy-credits/limit modal opens — fully separate from `pricing_page_view` (which stays untouched). No GTM tags or Google Ads conversions yet — only the dataLayer event.

## 1. Helper in `src/lib/gtm.ts`

`fireOnceSession(dedupKey, ttlMs, payload)` already exists with the exact signature, has safe in-memory fallback, and pushes to `window.dataLayer`. But to satisfy the richer debug requirement (must log `dedupHit` AND `willFire`), the new helper inlines the same dedup logic instead of delegating, so we can log the outcome before push.

```ts
const PRICING_MODAL_TTL_MS = 15 * 60 * 1000;

export function gtmPricingModalView(args: {
  userId?: string | null;
  modalName: string;
  source?: string | null;
  currentPlan?: string | null;
  pageLocation?: string;
}): void {
  const { userId, modalName, source, currentPlan, pageLocation } = args;
  if (!modalName) return;
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const dedupKey = `pricing-modal:${modalName}:${path}`;
  const storeKey = `${SESSION_PREFIX}${dedupKey}`;        // → "gtm-session:pricing-modal:..."
  const now = Date.now();
  const last = sessionGetTs(storeKey);                    // already wrapped in try/catch
  const dedupHit = last !== null && now - last < PRICING_MODAL_TTL_MS;
  const willFire = !dedupHit;

  if (isGtmDebugEnabled() || DEBUG) {
    console.log('[GTM DEBUG pricing_modal_view]', {
      modalName, source, currentPlan, path, dedupKey, dedupHit, willFire,
    });
  }
  if (!willFire) return;
  sessionSetTs(storeKey, now);
  rawPush({
    event: 'pricing_modal_view',
    ...(userId ? { user_id: userId } : {}),
    modal_name: modalName,
    ...(source ? { source } : {}),
    ...(currentPlan ? { current_plan: currentPlan } : {}),
    page_location: pageLocation || (typeof window !== 'undefined' ? window.location.href : ''),
  });
}
```

`pricing_page_view` and all other helpers remain untouched.

## 2. Fire on the false → true open transition only

Each modal component uses `useEffect` with a `useRef` previous value, firing only when `open` flips from `false` to `true`:

```ts
const prevOpen = useRef(false);
useEffect(() => {
  if (open && !prevOpen.current) {
    gtmPricingModalView({ userId: user?.id, modalName, source, currentPlan: plan, ... });
  }
  prevOpen.current = open;
}, [open, ...]);
```

This guarantees no firing on render, on close, on unrelated state updates, or on page load.

## 3. Modal coverage

| File | `modal_name` | Open signal | Source prop |
|---|---|---|---|
| `BuyCreditsModal` | `buy_credits` | `buyModalOpen` (context) | `buyModalSource` (context) |
| `UpgradePlanModal` | `upgrade_plan` (or `low_credits` if `variant === 'no-credits'`) | `open` prop | new optional `source` prop |
| `UpgradeValueDrawer` | `upgrade_value_drawer` | `open` prop | new optional `source` prop (callers pass `layer2Reason`) |

`NoCreditsModal` is a thin wrapper around `UpgradePlanModal variant="no-credits"`, so the variant-based modal_name in `UpgradePlanModal` automatically covers it without double-firing. `GlobalUpgradeModal` only renders `BuyCreditsModal`, also no double-fire.

All three new `source` props are **optional** — every existing call site keeps working unchanged.

## 4. `CreditContext` — optional source for `openBuyModal`

```ts
openBuyModal: (source?: string) => void;
buyModalSource: string | null;          // exposed for BuyCreditsModal to read
```

Implementation:
```ts
const [buyModalSource, setBuyModalSource] = useState<string | null>(null);
const openBuyModal = useCallback((source?: string) => {
  setBuyModalSource(source ?? null);
  setBuyModalOpen(true);
}, []);
const closeBuyModal = useCallback(() => {
  setBuyModalOpen(false);
  setBuyModalSource(null);                // reset on close so source never leaks
}, []);
```

Existing zero-arg callers stay valid (TypeScript accepts dropping an optional arg).

## 5. Source attribution at known-safe call sites

Only update where the source is obvious:

| Call site | Source value |
|---|---|
| `LowCreditsBanner` → `openBuyModal()` | `low_credits_banner` |
| `CreditIndicator` Pro/Enterprise top-up `openBuyModal()` | `header_cta` |
| `CreditIndicator` `<UpgradePlanModal>` (canUpgrade path) | `header_cta` (passed as new `source` prop) |
| `AppShell` line 252 sidebar credits button | `sidebar_cta` |
| `AppShell` line 484 mobile topbar credit pill | `topbar_cta` |
| `PostGenerationUpgradeCard` See Plans → `openBuyModal()` in Freestyle / Generate / TextToProduct | `post_gen_card` |

All other call sites stay unchanged (source omitted, payload skips the field). Generate.tsx's `<UpgradePlanModal>` instances and Freestyle's other openBuyModal calls remain unattributed because no clear source label fits.

## 6. Privacy

Payload contains only: `user_id`, `modal_name`, `source`, `current_plan`, `page_location`. No emails, names, prompts, image URLs, Stripe IDs, payment info, plan amounts, or product titles.

## 7. Debug logging

Active when `localStorage.getItem('vovv_gtm_debug') === '1'` OR `import.meta.env.DEV`. Production stays silent unless flag set. Log line includes `dedupHit` and `willFire` so you can see in console exactly whether the event fired or was skipped.

## 8. Files to change

1. `src/lib/gtm.ts` — add `gtmPricingModalView` helper.
2. `src/contexts/CreditContext.tsx` — add optional `source` arg + expose `buyModalSource` + reset on close.
3. `src/components/app/BuyCreditsModal.tsx` — fire on `buyModalOpen` true edge.
4. `src/components/app/UpgradePlanModal.tsx` — accept optional `source` prop, fire on `open` true edge with variant-aware `modal_name`.
5. `src/components/app/UpgradeValueDrawer.tsx` — accept optional `source` prop, fire on `open` true edge.
6. Source-attribution sites: `LowCreditsBanner.tsx`, `CreditIndicator.tsx`, `AppShell.tsx` (2 buttons), `Freestyle.tsx`, `Generate.tsx`, `TextToProduct.tsx` (PostGenerationUpgradeCard onSeeMore).
7. Pass `source="layer2_${layer2Reason}"` (or just `layer2Reason`) to `<UpgradeValueDrawer>` in Freestyle.tsx where it's mounted.

## 9. Test plan

1. GTM Preview connected to `GTM-P29VYFW3`.
2. Click sidebar credits button → expect `pricing_modal_view` with `modal_name: "buy_credits"`, `source: "sidebar_cta"`, `current_plan: "<plan>"`.
3. Close + reopen same modal → no fire (dedup, console shows `dedupHit: true, willFire: false`).
4. Click header Upgrade button → expect `pricing_modal_view` with `modal_name: "upgrade_plan"`, `source: "header_cta"`.
5. Run a generation as a free user with 0 credits → expect `pricing_modal_view` with `modal_name: "low_credits"`.
6. Trigger Layer 2 upgrade drawer → expect `pricing_modal_view` with `modal_name: "upgrade_value_drawer"`.
7. Navigate to a different `/app/...` page and reopen Buy Credits → fires (different path in dedup key).
8. Visit `/app/pricing` → `pricing_page_view` still fires (unchanged), `pricing_modal_view` does NOT fire.

## Report (delivered after implementation)

Will include: components updated, modal_name per component, source per call site, current_plan availability per modal, dedup behavior verified, and GTM Preview test results.
