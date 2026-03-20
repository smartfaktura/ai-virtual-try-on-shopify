

# Fix: Theme Not Applied, Credit Balance Not Refreshing, Progress Not Updating + Mobile Improvements

## Issues Found

### Bug 1: Theme always saves as "custom" (ROOT CAUSE of no seasonal direction)
`handleSeasonalPreset` updates `seasonalPreset` and `themeNotes` but **never calls `setTheme(presetId)`**. The `theme` state stays `'custom'`, which is saved to the schedule and passed to `trigger-creative-drop`. The generation prompt then skips the `SEASONAL DIRECTION` block because `theme === 'custom'`.

DB confirms: all 8 jobs for the Spring Drop have `theme: "custom"`.

### Bug 2: Credit balance doesn't refresh after drop
Credits ARE deducted on the backend (56 → 8 = 48 deducted). But the sidebar credit indicator uses `CreditContext` which only refreshes via `check-subscription` every 60s. After launching a drop, `refreshBalance` is never called, so the UI shows stale balance.

### Bug 3: Progress jumps from 0% to "ready" instantly
The drop completed in ~85 seconds (8 try-on jobs). The progress bar uses a time-based estimate (`Date.now() - created_at`) with 8s/image, estimating ~64s total. Since polling is every 5s, the drop can complete between two polls. The `complete-creative-drop` function updates the status to `ready`, so the next poll sees it as ready — the "0 of 8 images" text is wrong because it's checking `dropImages.length` (images in the drop record) vs `total_images`, but during generating the images array is empty (images are only written by `complete-creative-drop` when ALL jobs finish).

### Bug 4: Mobile layout needs improvement
On 390px viewport: stats ribbon text is cramped, Create Drop button is just an icon with no label, drop cards need tighter spacing.

## Changes

### File 1: `src/components/app/CreativeDropWizard.tsx`
**Fix theme saving** — In `handleSeasonalPreset`, add `setTheme(presetId === 'none' ? 'custom' : presetId)`. This ensures the seasonal preset ID (e.g., `spring`, `winter`) is saved to the schedule and forwarded to the generation engine.

### File 2: `src/components/app/CreativeDropWizard.tsx`  
**Refresh credits after launch** — After successful `trigger-creative-drop` invoke (~line 560), call `refreshBalance()` from `useCredits()` so the sidebar balance updates immediately.

### File 3: `src/components/app/DropCard.tsx`
**Fix progress display during generating** — Instead of showing "0 of 8 images" (which checks `dropImages.length` — always 0 during generation since images are only written on completion), show time-based progress only: `"Generating… ~X min remaining"`. Remove the misleading image count from generating state.

### File 4: `src/pages/CreativeDrops.tsx`
**Mobile improvements:**
- Stats ribbon: reduce min-width and font sizes for mobile (`min-w-[80px]` instead of `110px`, smaller text)
- Show "Create Drop" text on mobile button instead of icon-only
- Reduce padding in drop cards on mobile

### File 5: `src/components/app/DropCard.tsx`
**Mobile card improvements:**
- Reduce thumbnail grid size on mobile (from 68px to 56px)
- Tighter padding on mobile (`p-3 sm:p-4`)

## Summary
- 3 files, ~20 lines changed
- Critical fix: theme now correctly saved as `spring`/`winter`/etc. instead of always `custom`
- Credit balance refreshes immediately after drop launch
- Progress bar no longer shows misleading "0 of 8 images"
- Mobile layout improvements for `/app/creative-drops`

