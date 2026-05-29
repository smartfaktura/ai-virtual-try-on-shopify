## Goal
Tighten mobile (≤390px) on both `/app/video/animate` and `/app/video/start-end`. Main complaint: Upload + Library buttons inside each Start/End frame slot stack vertically and look narrow. Secondary: the mobile "Transition ↓" chip lands at the bottom instead of between the two frames, and AnimateVideo's "Choose from Library" label gets truncated on mobile.

## Issues found

**StartEndVideo — `src/components/app/video/start-end/StartEndUploadPair.tsx`**
1. **Upload / Library buttons stack vertically on mobile.** The wrapper is `flex flex-col sm:flex-row gap-2.5 w-full max-w-[280px]` → on mobile the two buttons sit in a narrow 280px column, one on top of the other. User reads this as "super narrow buttons not correct".
2. **Mobile "Transition ↓" chip lives outside the grid**, in a sibling `<div className="flex sm:hidden ... my-1">` rendered AFTER both Slots. Visually the chip sits below the End frame instead of between Start and End.
3. Each Slot uses `aspect-[4/5] min-h-[280px]` — fine, keep.

**AnimateVideo — `src/pages/video/AnimateVideo.tsx`**
1. The "Choose from Library" button label truncates on mobile (`Choose from Lib...`) because the 2-col grid gives each button ~165px and the label + icon + padding don't fit. Shorten the mobile label to "Library" (keep "Choose from Library" on `sm:` and up). Same idea on the "Upload image" → keep as-is, it fits.

## Changes

### `src/components/app/video/start-end/StartEndUploadPair.tsx`
1. Buttons row inside `Slot` (the `flex flex-col sm:flex-row ... max-w-[280px]` wrapper):
   - Change to `flex flex-row gap-2 w-full max-w-[320px]` so Upload and Library always sit side by side, and grow to fit the slot width on mobile.
2. Mobile direction chip:
   - Remove the standalone `<div className="flex sm:hidden ... my-1">` block at the bottom.
   - Add a new mobile-only absolutely-positioned chip inside the existing `<div className="relative">`, mirroring the desktop one: `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 sm:hidden`, content `Transition` + `ArrowDown`. This places it between Start (top) and End (bottom) in the single-column grid.

### `src/pages/video/AnimateVideo.tsx`
1. Secondary "Choose from Library" button (around line 678):
   - Replace the static label with `<span className="truncate"><span className="sm:hidden">Library</span><span className="hidden sm:inline">Choose from Library</span></span>` so mobile shows "Library", desktop keeps the full label. No other changes.

## Out of scope
- No logic changes anywhere.
- No changes to `PageHeader`, sticky bottom CTA, `CreditEstimateBox`, `TransitionGoalSelector`, `TransitionRefinementPanel`, `PreservationRulesPanel`, `TransitionSummaryCard`, or `AudioModeSelector` — they read clean at 390px.
- No desktop visual changes — mobile-only additions or label swaps.

## Verification
At 390×844:
- `/app/video/start-end`: Upload + Library sit side by side inside each frame slot; "Transition ↓" chip sits centered between Start and End in single-column layout.
- `/app/video/animate`: "Upload image" + "Library" both fit cleanly with no truncation on mobile; full "Choose from Library" label still shows from `sm` breakpoint up.
