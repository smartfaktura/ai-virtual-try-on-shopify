

# Replace Zap with a Smaller Plus Icon + Open Buy Credits Modal

## Problem
The Zap icon button is too large and visually heavy. The user wants a clean, properly sized Plus icon that opens the buy credits modal on click.

## Changes

**`src/components/app/CreditIndicator.tsx`**:

1. **Swap icon**: Replace `Zap` import with `Plus` from lucide-react
2. **Shrink button**: Reduce from `w-8 h-8` to `w-6 h-6` for a subtler, proportional look next to the credit numbers
3. **Shrink icon**: Change from `w-3.5 h-3.5` to `w-3 h-3`
4. **Change onClick**: Switch from `navigate('/app/settings')` back to `openBuyModal` so it opens the buy credits popup modal
5. **Update title**: Set to `"Buy credits"`

Result: a small, crisp `+` button that opens the credits modal — clean and well-proportioned for the sidebar.

