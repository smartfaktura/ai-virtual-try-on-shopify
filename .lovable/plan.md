

## Improve Creative Drops Mobile View

Based on the screenshot and code review, here are the mobile layout issues and the fixes needed to make everything look polished on small screens.

---

### Issues Identified

1. **Step indicator labels hidden but step circles feel cramped** -- The step circles (1-5) use `gap-0` with flex-1 connectors, which works but the connecting lines are too thin and close on small screens.

2. **Theme grid (3 columns) causes text wrapping** -- On narrow phones (360px), labels like "Black Friday", "Back to School", and "Valentine's" wrap awkwardly inside the 3-column grid. The buttons need a 2-column layout on the smallest screens.

3. **Product grid is 3 columns on all sizes** -- `grid-cols-3` is tight on mobile, making product thumbnails very small and hard to tap. Should be 2 columns on mobile, 3 on larger.

4. **Workflow config expanded sections (Scenes, Models, Poses) have too many columns on mobile** -- Scenes use `grid-cols-5`, models use `grid-cols-6`. On a phone, these are impossibly small thumbnails. Should reduce to 3-4 cols on mobile.

5. **Sticky credit calculator has `pr-14` padding** -- This creates unnecessary right padding on mobile, wasting space.

6. **Footer buttons ("Cancel"/"Next") don't accommodate validation hints well on mobile** -- The center validation hint text can overlap with the buttons on narrow screens.

7. **Schedule step: "Images Per Workflow" row of 4 preset buttons + custom input overflows** -- 4 buttons + an input in a single flex row is too crowded on mobile.

8. **DropCard schedule info grid is `grid-cols-1 sm:grid-cols-3`** -- This is fine, but the Pause/Resume button and dropdown in the top row can be cramped on narrow screens.

9. **Calendar view day cells are small** -- The 7-column grid with `aspect-square` works but `text-sm` is a bit small for touch targets.

10. **Stats summary grid uses `grid-cols-2 sm:grid-cols-4`** -- The 5th stat card (generating/next run) breaks the 2-col layout on mobile, creating an orphan.

---

### Planned Changes

**File: `src/components/app/CreativeDropWizard.tsx`**

- **Theme grid**: Change from `grid-cols-3` to `grid-cols-2 sm:grid-cols-3` so themes get proper breathing room on phones
- **Product grid**: Change from `grid-cols-3` to `grid-cols-2 sm:grid-cols-3` for larger, more tappable product cards
- **Scene grid**: Change from `grid-cols-5 sm:grid-cols-6` to `grid-cols-3 sm:grid-cols-5` for readable scene thumbnails
- **Pose grid**: Same fix -- `grid-cols-3 sm:grid-cols-5` instead of `grid-cols-5 sm:grid-cols-6`
- **Model grid**: Change from `grid-cols-6 sm:grid-cols-8` to `grid-cols-4 sm:grid-cols-6 md:grid-cols-8` for bigger model avatars
- **Sticky credit bar**: Remove `pr-14` padding, use `pr-1` to match left
- **Images Per Workflow row**: Wrap preset buttons into a `grid grid-cols-2 sm:grid-cols-4` with the custom input below on mobile
- **Footer**: Stack validation hint below the buttons on mobile using responsive layout, and ensure min touch target of 44px on action buttons
- **Step indicator connector lines**: Add slightly more spacing (`mx-1 sm:mx-2`) for mobile

**File: `src/pages/CreativeDrops.tsx`**

- **Stats grid**: Change 5th stat to always show in the 2-col flow on mobile (remove the conditional that can create orphans)
- **Tabs filter bar (Drops tab)**: Ensure the status filter chips don't overflow -- add `flex-wrap` or `overflow-x-auto` with `scrollbar-hide`
- **Schedule card top row**: Ensure Pause button text is hidden on very small screens, showing only icon

**File: `src/components/app/DropCard.tsx`**

- **Schedule card action button**: Use icon-only on mobile (`gap-1.5 sm:gap-1.5`) and hide "Pause"/"Resume" text below `sm`
- **Drop card thumbnails**: Ensure thumbnails don't overflow on narrow screens

---

### Technical Details

All changes are CSS/Tailwind-only responsive adjustments. No logic or data flow changes. The core pattern is replacing fixed column counts with responsive breakpoints (`grid-cols-2 sm:grid-cols-3`, etc.) and adding `flex-wrap` where inline layouts can overflow.

Priority: Theme grid and Product grid fixes are the most visible improvements. The scene/model/pose grids inside workflow config are secondary but important for usability.

