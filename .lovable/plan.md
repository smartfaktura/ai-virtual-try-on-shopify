

## Fix OTP Input Not Fitting on Mobile

### Problem
The 8-digit OTP input overflows horizontally on mobile. Each slot is hardcoded at `w-14 h-14` (56px). With 8 slots + gaps + separator, it needs ~500px but mobile screens are ~360–440px wide.

### Fix

**File: `src/components/ui/input-otp.tsx`** (line 36)
- Change the slot size from fixed `h-14 w-14` to responsive: `h-10 w-10 sm:h-14 sm:w-14`
- Reduce text size on mobile: `text-lg sm:text-2xl`

**File: `src/pages/Auth.tsx`** (lines 371, 380)
- Reduce gap on mobile: change `gap-2` to `gap-1 sm:gap-2` on both `InputOTPGroup` elements

### Files to edit
- `src/components/ui/input-otp.tsx` — Responsive slot sizing
- `src/pages/Auth.tsx` — Tighter gaps on mobile

