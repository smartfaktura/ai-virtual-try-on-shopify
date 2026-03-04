

## Redesign GlobalGenerationBar as a Compact, Non-Intrusive Widget

### Problem
The current GlobalGenerationBar is a large, centered floating panel that:
1. Takes up too much visual space on Freestyle (looks like a primary modal, not a secondary indicator)
2. Overlaps with the StudioChat FAB button on mobile
3. Feels like a blocking element rather than a subtle background status indicator

### Solution
Redesign it as a **compact pill/chip anchored to the bottom-right** (opposite side from the chat FAB which is bottom-left). On mobile, position it above the chat button. The expanded state becomes a small dropdown-up card rather than a wide centered panel.

### Changes

**`src/components/app/GlobalGenerationBar.tsx`** — Full redesign:

1. **Position**: Move from centered `left-4 right-4` to `bottom-4 right-4` (desktop: `lg:right-6`). This avoids the chat FAB on the left side entirely.

2. **Collapsed state (default)**: A compact pill showing just the spinner icon + "1 generating" text + chevron. Roughly 200px wide, not a full-width bar.

3. **Expanded state**: A small 320px-wide card that drops upward from the pill, showing the job list. Same content as today but in a narrower, right-aligned card.

4. **Mobile spacing**: Use `bottom-4 right-4` — no overlap with the chat FAB at `bottom-4 left-4`. The bar is on the opposite corner.

5. **Also hide on `/app/freestyle`** when the Freestyle page already shows its own `QueuePositionIndicator` for the active job. Add `/app/freestyle` to `HIDDEN_PATHS` since the Freestyle page has its own inline indicator.

Actually, looking more carefully: the Freestyle page shows `QueuePositionIndicator` for *its own* generation, but the GlobalGenerationBar shows *workflow* jobs from other pages. So we should keep it visible on Freestyle but make it unobtrusive.

**Final approach**: Keep it on all non-hidden pages, but make it a small right-anchored widget:

```
┌──────────────────────────────┐
│ ⟳ 1 generation running    ▴ │  ← compact pill, bottom-right
└──────────────────────────────┘

Expanded (clicks pill):
┌──────────────────────────────┐
│ Generation — Product Name    │
│ Generating… 1m 35s  PROCESSING│
│──────────────────────────────│
│           View in Workflows →│
└──────────────────────────────┘
│ ⟳ 1 generation running    ▾ │
└──────────────────────────────┘
```

### Specific changes to `GlobalGenerationBar.tsx`:

- Change container from `fixed bottom-4 left-4 right-4 lg:left-[calc(...)]` to `fixed bottom-4 right-4 lg:right-6 z-30`
- Remove `max-w-2xl mx-auto` centering — use a fixed `w-80` or `max-w-xs` width
- Default to **minimized** (`useState(true)`) so it starts as a small pill
- On mobile, use `bottom-20` to sit above the chat FAB area (chat is bottom-left but give vertical clearance), or simply keep `bottom-4 right-4` since chat is on the left
- Keep the same polling/grouping logic unchanged

### Files changed — 1
- `src/components/app/GlobalGenerationBar.tsx` — Reposition to bottom-right, make compact pill style, default minimized

