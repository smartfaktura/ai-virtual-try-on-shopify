Fix three issues with the Free-plan model-limit toast on `/app/generate/product-images` setup step:

1. **Toast disappears too quickly** — extend visible duration from 3500ms to 4500ms so the user has time to read and click Upgrade.
2. **"Upgrade" not actionable** — the toast is currently passive text. Add an inline `Upgrade` link inside the toast that calls the existing `onUpgradeClick` (already wired through to `openBuyModal`). Visual: pill toast with body copy + a separator dot + bold underlined `Upgrade` button.
3. **Toast drifts off-center (jumps left)** — caused by `position: fixed` resolving relative to a transformed ancestor (animation/framer wrapper) instead of the viewport. Fix by rendering the toast through a React portal to `document.body` so `fixed left-1/2 -translate-x-1/2` truly centers it horizontally over the viewport.

Implementation in `src/components/app/product-images/ProductImagesStep3Refine.tsx`:

- Replace the inline toast block (lines 3723–3728) with a small `FreeLimitToast` helper rendered via `createPortal(..., document.body)`.
- New helper signature: `<FreeLimitToast active message onUpgradeClick />`. Pill keeps current classes (`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-foreground text-background text-xs font-medium shadow-lg animate-fade-in flex items-center gap-2`).
- Inside: `<span>1 model on Free</span>` · `<button onClick={onUpgradeClick} className="font-semibold underline-offset-2 hover:underline">Upgrade for multi-model shoots</button>`.
- Bump `setTimeout` in the existing auto-dismiss effect (line 1950) from 3500 → 4500.
- Also apply the same portal fix + Upgrade link to the background-color limit toast (`bgLimitHintAt`) for consistency, since it shares the same positioning bug.
- Apply the same portal wrapper to `FreeLimitToast` in `ProductImagesStep2Scenes.tsx` (lines 970–977) so the shots-step toast doesn't drift either.

No logic, no state, no layout changes outside the toast itself.