

# Fix Last Card Popover Alignment

## Problem
The "Top Style" card (5th/last card) has its popover aligned to `start` (left edge), which causes it to float awkwardly off the card's right boundary since it's near the viewport edge.

## Solution
Add a `popoverAlign` prop to `MetricCard` so individual cards can specify alignment. Default remains `start`, but the last card passes `end`.

### 1. `src/components/app/MetricCard.tsx`
- Add optional `popoverAlign?: 'start' | 'center' | 'end'` prop
- Use it in `PopoverContent align={popoverAlign || 'start'}`

### 2. `src/pages/Dashboard.tsx` (~line 532)
- Pass `popoverAlign="end"` to the "Top Style" MetricCard

