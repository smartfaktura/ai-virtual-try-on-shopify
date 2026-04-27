# Make "See Plans" open the regular pricing modal

The "Your first fragrance visual is ready" banner's **See Plans** button currently opens the custom upgrade drawer (`conversionState.openUpgradeDrawer('layer1_cta')`). Switch it to open the same `BuyCreditsModal` that the sidebar / top bar / low-credits banner use, via `openBuyModal()` from `useCredits()`.

## Changes

**`src/pages/Freestyle.tsx`** (line 1053–1056) — `openBuyModal` already destructured at line 171:
```tsx
onSeeMore={() => {
  conversionState.dismissLayer1();
  openBuyModal();   // was: conversionState.openUpgradeDrawer('layer1_cta')
}}
```

**`src/pages/Generate.tsx`** (line 4690–4693) — `openBuyModal` already destructured at line 308. Same swap.

**`src/pages/TextToProduct.tsx`** (line 974–977) — add `openBuyModal` to the existing `useCredits()` destructure on line 313, then same swap.

`onDismiss` (the X button) and the auto-show timing remain unchanged. The custom drawer code stays in place — it's still used by other layers / contexts.
