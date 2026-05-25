## Fix sidebar "Get credits" to open Top Up

**File:** `src/components/app/GlobalUpgradeModal.tsx`

Change the variant selection so all paid plans (Starter, Growth, Pro, Enterprise) get the top-up pack view instead of the plan picker:

```ts
const isTopupOnly = plan !== 'free';
```

### Result by plan

- **Free** → unchanged. Sidebar "Upgrade" opens `UpgradePlanModal` directly via `setUpgradeOpen` in `CreditIndicator.tsx`.
- **Starter / Growth / Pro / Enterprise** → sidebar "Get credits" opens `BuyCreditsModal` on the **Top Up** tab, showing instant credit packs. Users who want to change tier still have the "Compare plans" footer link routing to `/app/pricing`.

### Out of scope

- No changes to `CreditIndicator.tsx` (already correct).
- No Stripe, pricing, or `creditPacks` changes.
- No changes to the no-credits modal flow or `/settings`.
