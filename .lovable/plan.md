

# Fix Buy Credits Button in Freestyle

## Problems
1. **Button doesn't work with no prompt**: When credits are zero and there's no prompt, the "Buy Credits" button calls `onGenerate` which maps to `handleGenerate`. That function checks `if (!canSubmit) return` first — since there's no prompt or assets, `canSubmit` is false and nothing happens.

2. **Wrong popup when prompt exists**: When there IS a prompt but no credits, `handleGenerate` opens `NoCreditsModal` (the smaller conversion modal) instead of the main `BuyCreditsModal` (the full pricing popup with Plans + Top-Up tabs).

## Fix

### `src/components/app/freestyle/FreestylePromptPanel.tsx`

Add an `onBuyCredits` prop and wire the "Buy Credits" button to call it directly instead of `onGenerate`:

```tsx
// Props: add onBuyCredits
onBuyCredits?: () => void;

// Button onClick: change from onGenerate to onBuyCredits
<Button onClick={onBuyCredits} ...>
  Buy Credits
</Button>
```

### `src/pages/Freestyle.tsx`

1. Import `openBuyModal` from `useCredits()`
2. Pass `onBuyCredits={openBuyModal}` to `FreestylePromptPanel` via `panelProps`

This opens the main `BuyCreditsModal` (already mounted in `App.tsx`) directly — no prompt validation needed.

| File | Change |
|------|--------|
| `src/components/app/freestyle/FreestylePromptPanel.tsx` | Add `onBuyCredits` prop, wire Buy Credits button to it |
| `src/pages/Freestyle.tsx` | Destructure `openBuyModal` from `useCredits`, pass as `onBuyCredits` |

