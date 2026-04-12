

# Make the Plus (Buy Credits) Button Bigger

## Problem
The `PlusCircle` button in the credit indicator is too small (`p-1.5`, icon `w-4 h-4`) — hard to tap on mobile.

## Change
**`src/components/app/CreditIndicator.tsx`** — increase the button's tap target and icon size:
- Button padding: `p-1.5` → `p-2`
- Icon size: `w-4 h-4` → `w-5 h-5`
- Add `min-w-[36px] min-h-[36px]` for a reliable 36px mobile tap target

Single-line edit around line 55.

