

# Fix: Insufficient Credits UX on Creative Drop Launch

## Problem

The "Generate Now" button is greyed out but gives no visual explanation. The amber banner above is easy to miss — users don't understand why they can't proceed or what to do about it.

## Changes

### File: `src/components/app/CreativeDropWizard.tsx`

**1. Upgrade the insufficient credits banner** (lines 1735-1740) from a passive warning to an actionable block with a "Buy Credits" button:

- Replace the simple amber text banner with a more prominent card-style alert
- Add a "Buy Credits" button that calls `openBuyModal()` from `useCredits()`
- Add a "or Upgrade Plan" link to `/app/settings`
- Make the text clearer: "You need X more credits to generate this drop"

**2. Add disabled state styling to the button** (lines 1914-1923):

- When disabled due to insufficient credits, show a tooltip or helper text below the button explaining why it's disabled (e.g., "Not enough credits")
- Change button text from "Generate Now" to "Not Enough Credits" when disabled for credit reasons, making the reason immediately obvious

**3. Import `useCredits`** and call `openBuyModal` from the banner's CTA button.

### Summary

The key UX improvements:
- Button label changes to "Not Enough Credits" when disabled — no ambiguity
- Banner becomes actionable with "Buy Credits" button inline
- Shows exactly how many more credits are needed ("You need 4 more credits")

~15 lines changed in 1 file.

