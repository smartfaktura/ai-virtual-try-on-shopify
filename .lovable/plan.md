

# QA Debug — Conversion System (Layers 1–3)

## Bugs Found

### Bug 1: Layer 1 dismiss is broken — card can't be hidden
**Root cause**: Pages render the card based on `conversionState.canShowLayer1`, which is a `useMemo` with only `[isFreeUser]` as dependency. When the user clicks dismiss:
- `dismissLayer1()` sets `layer1Visible = false` (but pages never read `layer1Visible`)
- `dismissLayer1()` increments `localStorage` counter (but `useMemo` doesn't re-run because `isFreeUser` didn't change)
- Result: card stays rendered, and its internal `visible` state is already `true`, so it remains visible after dismiss

### Bug 2: Session tracking never activates
`showLayer1()` is never called by any page. This means `sessionStorage.setItem('vovv_l1_shown', 'true')` never happens. So `canShowLayer1` will keep returning `true` for the entire session, even after the card is shown.

### Bug 3: `canShowLayer2` has the same stale-memo problem
`canShowLayer2` is also `useMemo([isFreeUser])`. After `openUpgradeDrawer` increments the session counter, the memo doesn't recompute.

### Bug 4: PostGenerationUpgradeCard has no re-mount reset
The card's internal `visible` state uses a one-shot `useEffect` with a 3s timer. If the parent unmounts/remounts the card (e.g., navigating steps), the timer restarts — fine. But since dismiss doesn't actually unmount it (Bug 1), the 3s fade-in only happens once and then it's permanently visible.

## Fix Plan

### Fix `useConversionState.ts`
Replace `useMemo` with reactive state that actually updates on dismiss/show:

1. **Add a `layer1Dismissed` state** (`useState(false)`) that `dismissLayer1` sets to `true`. Pages use this combined with the initial eligibility check.
2. **Remove `showLayer1` / `layer1Visible`** — the card manages its own internal visibility (3s delay). The hook just needs to answer "should the card be mounted?"
3. **Replace `canShowLayer1` useMemo** with a computed value that includes the `layer1Dismissed` state:
   ```ts
   const [layer1Dismissed, setLayer1Dismissed] = useState(false);
   const canShowLayer1 = isFreeUser && !layer1Dismissed && dismissCount < 3 && !sessionShown;
   ```
4. **Fix `dismissLayer1`** to set `layer1Dismissed = true` AND mark session.
5. **Same fix for Layer 2**: Add `layer2Dismissed` state with cooldown, so `canShowLayer2` reacts properly.

### Fix pages (Generate.tsx, Freestyle.tsx, TextToProduct.tsx)
No changes needed — they already use `canShowLayer1` which will now be reactive.

### Files to modify
- `src/hooks/useConversionState.ts` — fix all reactivity bugs

