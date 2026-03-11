

## Redesign: Annual Billing Switch Card

### Problem
The current card is heavy and cluttered — two bordered boxes side-by-side with redundant price info, a savings pill, and a CTA button all in a bordered container. It takes up too much vertical space and feels like a mini-page within the modal.

### Proposed Design
Replace the two-column card layout with a single, compact inline banner — one row with the key message and action:

```text
Before (tall, 2-column):
┌─────────────────────────────────────────┐
│ ✨ Switch your Pro plan to annual billing│
│ ┌──────────┐  ┌──────────┐             │
│ │ $179/mo  │  │ $143/mo  │             │
│ │ $2148/yr │  │ $1716/yr │             │
│ └──────────┘  └──────────┘             │
│ [Save $432]        [Switch to Annual →]│
└─────────────────────────────────────────┘

After (compact banner):
┌─────────────────────────────────────────┐
│ Save $432/yr — switch to annual at      │
│ $143/mo instead of $179/mo  [Switch →] │
└─────────────────────────────────────────┘
```

### Changes — `src/components/app/BuyCreditsModal.tsx`

1. **Replace the entire `showAnnualSwitchCard` block** (lines 248-282) with a single-row banner:
   - Subtle `bg-emerald-500/5 border border-emerald-500/20` container, `rounded-xl`, `p-4`
   - Left side: Savings amount in bold green, then the price comparison as secondary text
   - Right side: Compact "Switch →" button
   - On mobile: text wraps naturally, button goes full-width below

2. **Remove**: The two-column price grid, the sparkles icon, the uppercase labels, the redundant year totals

### Result
- Saves ~100px of vertical height
- Cleaner, more actionable — one clear message instead of a data table
- Matches the minimal aesthetic of the rest of the modal

