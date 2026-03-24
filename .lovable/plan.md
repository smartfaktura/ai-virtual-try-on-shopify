

# Fix Mobile Scroll Hint Not Returning to Start

## Problem
The micro-scroll animation scrolls right to 40px but doesn't reliably scroll back to 0, leaving the first card hidden off-screen on mobile.

## Fix

### `src/components/app/freestyle/FreestyleQuickPresets.tsx`

Update the scroll hint effect to ensure it always returns to `left: 0`:
- Increase the return delay from 400ms to 600ms to give the forward scroll time to complete
- Add a safety `scrollTo({ left: 0 })` call after setting sessionStorage
- This ensures the carousel always rests at the beginning showing the first card fully visible

