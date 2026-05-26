## Changes to `src/pages/ProductSwap.tsx`

### 1. Header: stack back button above title

The back button currently sits inline with "Product Swap" (because `PageHeader` uses `sm:flex-row`). Render it stacked instead:

- Drop the `backAction` prop from `<PageHeader>`.
- Add a standalone ghost `Visual Studio` back button immediately above `<PageHeader>` so the order on every breakpoint is:

```
← Visual Studio
Product Swap
Same scene, different product
```

### 2. Remove the redundant Generate button on Step 3

Step 3 currently shows two identical Generate CTAs:
- One inside the right-rail "Cost Summary" card (lines 956–974).
- One in the sticky bottom action bar (lines 1083–1090).

Drop the cost-summary CTA block entirely (both the `Generate N images` button and its `Get more credits` fallback). The sticky bottom bar already handles both states (`handleGenerate` when affordable, `setNoCreditsOpen` otherwise) and is always visible.

Keep the cost summary's numeric rows (Products / Aspect / Images / Cost per image / Total / Your balance / After generation) — only the button is removed.

No other behaviour changes.