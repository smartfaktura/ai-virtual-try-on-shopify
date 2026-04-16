

# Mobile-Optimized No Credits Modal + Drawer Pill/Alignment Fixes

## Problem
1. The **No Credits Modal** (Layer 3) uses a centered dialog that doesn't work well on mobile — cards stack vertically and require scrolling in a small viewport. Should be a **full-screen sheet** on mobile for easy skimming and quick dismissal.
2. The **Value Drawer** (Layer 2) header section has alignment issues on mobile: headline/subline aren't left-aligned, and the unlock-item pills (Studio, On-Model, Lifestyle...) are unnecessary clutter on small screens.

## Solution

### 1. NoCreditsModal — full-screen on mobile
Add mobile-specific classes to `DialogContent`:
- On mobile (`max-w-2xl` → override): `inset-0 w-full h-full max-h-full rounded-none` so the modal fills the screen
- Keep the existing `max-w-2xl sm:rounded-lg` for desktop
- The existing `overflow-y-auto` handles scrolling
- Plan cards remain stacked (`grid-cols-1`) on mobile, `sm:grid-cols-3` on desktop — already correct

Specific class change on line 71:
```
sm:max-w-2xl max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:max-h-full max-sm:translate-x-0 max-sm:top-0 max-sm:left-0 max-sm:rounded-none
```

### 2. UpgradeValueDrawer — hide pills on mobile, fix alignment
- **Hide unlock-item pills on mobile**: wrap the pills `div` (line 103) with `hidden sm:flex` so they only show on desktop
- **Left-align header text**: The `SheetTitle` and `SheetDescription` are already left-aligned (inside a flex row with avatar). The issue is the unlock headline/subline text — currently there's no separate unlock section visible, the pills ARE the unlock section. Hiding pills on mobile is sufficient.

### Files changed
- `src/components/app/NoCreditsModal.tsx` — make DialogContent full-screen on mobile
- `src/components/app/UpgradeValueDrawer.tsx` — hide category pills on mobile with `hidden sm:flex`

