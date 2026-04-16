

# Value Drawer — Adaptive Height Fix

## Problem
The drawer uses `h-full` on the inner container and `flex-1` with `justify-between` on the plan cards section, but the `SheetContent` has `overflow-y-auto` which prevents `h-full` from resolving to the viewport height. The cards don't stretch to fill the screen — they cluster with whitespace below.

## Fix — `UpgradeValueDrawer.tsx`

1. **Make inner container fill viewport** — Change wrapper from `h-full` to `min-h-full` so it expands properly within the scrollable sheet. The SheetContent already handles overflow.

2. **Plan cards section adapts** — Keep `flex-1` on the cards container but replace `justify-between` with `gap-3` only. On tall screens the cards naturally spread; on short screens they stack without forcing awkward gaps.

3. **Remove fixed `pb-8`** — Replace with `pb-safe` or just `pb-5` so it doesn't eat space on small screens.

4. **Compact plan cards on small viewports** — Reduce `space-y-3` to `space-y-2` and `p-4` to `p-3` inside each card. Price font stays `text-2xl`. This saves ~40px total across 3 cards.

5. **Header tightening** — Reduce `pt-10` to `pt-6` and `pb-5` on header/pills to `pb-3` — reclaims ~30px for the cards.

6. **SheetContent height** — Add `h-full` to SheetContent so the flex column resolves against the actual viewport, not content height. Remove `overflow-y-auto` from SheetContent and instead put `overflow-y-auto` on the inner wrapper so flex layout works against the fixed viewport height.

### Resulting structure:
```text
SheetContent (h-full, no scroll)
  └─ div.flex.flex-col.h-full.overflow-y-auto  ← scrolls if needed
       ├─ Header (compact pt-6)
       ├─ Pills (pb-3)
       ├─ Context row (optional)
       └─ Cards section (flex-1, gap-3)
            ├─ Starter card (p-3)
            ├─ Growth card (p-3)
            └─ Pro card (p-3, mb-5)
```

On tall screens: cards distribute with natural spacing. On short screens: content scrolls gracefully. No wasted whitespace.

## Single file change
`src/components/app/UpgradeValueDrawer.tsx`

