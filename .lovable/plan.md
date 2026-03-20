

# Improve Calendar View & Mobile Layout

## Current Issues

From the screenshot at 390px mobile viewport:
- Calendar cells are cramped with single-letter day headers
- Day cells are small and hard to tap on mobile
- The drop/scheduled indicators (tiny 4px bars) are barely visible
- Popover for scheduled days may not work well on mobile (gets clipped)
- The tabs + "Create" button row is tight on mobile
- No visual distinction between months with activity vs empty months
- Calendar doesn't show drop details inline — just dots

## Changes

### File 1: `src/pages/CreativeDrops.tsx` — CalendarView improvements

**Calendar grid enhancements:**
1. Use full 3-letter day headers on desktop, keep single-letter on mobile (`Su Mo Tu` vs `S M T`)
2. Increase cell min-height on mobile from `min-h-[44px]` to `min-h-[48px]` for better tap targets
3. Replace tiny bar indicators with small colored dots (easier to see at any size)
4. For days with drops: show a small count badge (e.g., "2") if multiple drops exist
5. Add status-aware dot colors: primary for completed, amber for generating, muted for scheduled

**Mobile popover fix:**
- On mobile, use a bottom sheet style (or `side="bottom"`) for the popover content instead of `side="top"` which clips on small screens
- Show drop details in the popover too (not just schedules) — clicking a day with completed drops should show drop names and "View Drop" links

**Today indicator:**
- Add a subtle ring/border around today's date instead of just background color, making it more visible

**Month navigation:**
- Add "Today" button between arrows to quickly return to current month
- Show dot summary below month name: "2 drops · 1 scheduled this month"

### File 2: `src/pages/CreativeDrops.tsx` — Mobile tab bar improvements

**Tab row layout on mobile:**
- Make tabs full-width on mobile with equal sizing (`flex-1` on each trigger)
- Move "Create" button below the tabs on mobile as a full-width secondary action, or keep it compact but ensure it doesn't overflow
- Reduce tab text to shorter labels on mobile if needed

## Summary
- 1 file, ~40 lines changed
- Better tap targets and dot indicators for mobile calendar
- Popovers show both drops and schedules with actions
- "Today" quick-return button
- Mobile-friendly tab layout

