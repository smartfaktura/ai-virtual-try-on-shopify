

# Disable Auto-Framing on Product Selection

## Problem
When a user selects a product, `detectDefaultFraming` automatically sets the framing based on product keywords. The user wants to choose framing manually.

## Change

### `src/pages/Freestyle.tsx`

In the `onSelectProduct` handler, remove the call to `detectDefaultFraming` and the subsequent `setFraming(...)` line. Keep framing at whatever the user has already set (or null/auto).

### Files
- `src/pages/Freestyle.tsx` — remove auto-framing logic from `onSelectProduct`

