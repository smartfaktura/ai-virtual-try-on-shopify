

## Fix: BuyCreditsModal slide animation → simple fade-in

### Problem
The BuyCreditsModal uses the base `DialogContent` which has `top-[5%]` on mobile with `h-full` and `max-h-[100dvh]`, creating a perceived "slide from corner" effect as the full-height dialog fades in from the top offset. The `animate-in` from tailwindcss-animate may also inherit default transform values that contribute to the sliding feel.

### Fix

**`src/components/app/BuyCreditsModal.tsx`** — Override the DialogContent className to:
- On mobile: use `top-0 translate-y-0 inset-0` for true full-screen positioning (no offset that creates a sliding look)
- Remove default `animate-in`/`animate-out` slide/zoom and keep only opacity fade:
  - Add explicit `data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-out-to-bottom-0` (zero values to neutralize any default slide)
  - Or override with `data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100` to neutralize zoom

Specifically, update line 113's className to include:
- `sm:top-[50%] sm:translate-y-[-50%]` (keep desktop centered)
- `top-0` on mobile instead of inheriting `top-[5%]`
- Add `data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-out-to-bottom-0 data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100` to ensure only the fade effect applies

