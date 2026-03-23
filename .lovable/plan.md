

# Fix Metric Cards: Compact Size, Brand Fonts, Hover as External Popover

## Problems
1. Cards are too tall (`min-h-[160px] sm:min-h-[180px]`) — way too much vertical space
2. Font styling doesn't match VOVV.AI brand (should use the project's default `font-sans` / tracking-tight, not oversized display text)
3. Hover tooltip renders inside the card, making it bloated — should render as a floating popover box that appears beside/below the card on hover
4. On mobile, the inline tooltip adds unwanted height

## Changes

### 1. `src/components/app/MetricCard.tsx` — Full rework

**Make cards compact**: Remove `min-h-[160px] sm:min-h-[180px]`. Use `p-4 sm:p-5` padding instead of `p-6 sm:p-7`. Cards should be tight and data-focused.

**Brand typography**: Value uses `text-lg sm:text-xl font-semibold tracking-tight` — elegant, not oversized. Title uses `text-[10px] sm:text-[11px] font-medium tracking-widest uppercase text-muted-foreground`. Suffix uses `text-[10px] text-muted-foreground/60 mt-0.5`.

**Hover as external popover**: Remove the inline tooltip div entirely. Wrap the card in a Popover (from Radix) with `openOnHover` behavior — on hover, a small floating box appears below the card showing the team avatar + explainer. On mobile, use click-to-open instead.

Implementation: Use `onMouseEnter`/`onMouseLeave` to control a `useState` for open state, with the Popover positioned below the card. On mobile, the Popover opens on tap (click the info icon).

```text
┌────────────────┐
│ € COST SAVED   │
│ €42,930        │
│ vs photoshoots │
└────────────────┘
  ┌──────────────────────────┐
  │ 🟡 Omar · Based on €30  │  ← floating popover on hover
  │    avg per product photo │
  └──────────────────────────┘
```

**Remove all inline tooltip rendering** — no border-t, no mt-auto, no opacity transitions inside the card.

### 2. `src/pages/Dashboard.tsx`

No prop changes needed — just the MetricCard component handles the new popover behavior.

### Files
- `src/components/app/MetricCard.tsx` — compact sizing, brand fonts, hover popover

