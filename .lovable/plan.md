

# Fix Earn Credits Modal: Mobile Spacing + Copy Caption Button

## Problem
1. On mobile, the modal content is too tight on the sides — needs more horizontal padding
2. User has to manually type the caption "Made with @VOVV.AI" — should have a one-tap copy button

## Changes

### `src/components/app/EarnCreditsModal.tsx`

**Mobile spacing**: Increase side padding from `px-6` to `px-5 sm:px-6` across all sections, and add `mx-3 sm:mx-0` margin on the DialogContent so the modal doesn't touch screen edges on mobile.

**Copy caption button**: Add a styled caption preview card inside Step 2 with a "Copy" button:
```
"Made with @VOVV.AI"  [Copy]
```
- Uses `navigator.clipboard.writeText()` with a toast confirmation
- Small inline card with monospace-style text, border, and a copy icon button
- Shows "Copied" feedback briefly via local state

**Implementation details:**
- Add `useState` for `copied` state + `Copy, Check` icons from lucide
- Import `toast` from sonner
- Caption string: `Made with @VOVV.AI`
- The copy card sits below Step 2's description text, inside the same step card
- Button: small pill with `Copy` / `Check` icon swap on click

### Files
- `src/components/app/EarnCreditsModal.tsx` — add copy caption, fix mobile padding

