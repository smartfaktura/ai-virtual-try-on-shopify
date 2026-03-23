

# Align Popover to Card's Left Edge (Bottom-Start)

## Problem
The popover currently uses `align="center"` which positions it centered under the card. This looks inconsistent across cards. It should align to the card's left edge for a clean, predictable layout.

## Change

### `src/components/app/MetricCard.tsx` (line 127-129)

Change popover alignment from `center` to `start`:

```tsx
<PopoverContent
  side="bottom"
  align="start"
  sideOffset={6}
  className="w-[240px] p-3 rounded-xl shadow-lg border border-border/60"
```

This anchors the popover's left edge to the card's left edge on every card, giving a consistent, clean layout across the row.

### Files
- `src/components/app/MetricCard.tsx` — change `align="center"` to `align="start"`

