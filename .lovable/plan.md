

# Fix Creative Drops Wizard — Step 1 UX Polish

## Issues from Screenshot
1. Back button says "Back to Schedules" — should say "Back to Creative Drops"
2. Page title "Creative Drops" + wizard heading "Create Your Drop" + step label "Details" = triple-redundant header stack on mobile
3. Placeholder text "e.g. Summer 2026 Collection" feels informal/unprofessional
4. Special Instructions textarea is on step 0 (Details) — user hasn't configured anything yet and doesn't know what instructions to give. Should move to the end.
5. Overall step 0 feels cluttered on mobile with too many sections crammed in

## Changes

### 1. Fix back button text — `src/pages/CreativeDrops.tsx`
Change `'Back to Schedules'` to `'Back to Creative Drops'` on line 243.

### 2. Clean up redundant headers — `src/components/app/CreativeDropWizard.tsx`
- Remove the "Create Your Drop" / "Edit Drop" heading (line 559) — the page title + progress stepper already provide context
- Keep the step label and progress bar as the only navigation indicators
- This eliminates the triple-stacked text on mobile

### 3. Better placeholder — `src/components/app/CreativeDropWizard.tsx`
Change the drop name placeholder from `"e.g. Summer 2026 Collection"` to something cleaner like `"Spring Campaign"` — short, no "e.g." prefix.

### 4. Move Special Instructions to last step before Review — `src/components/app/CreativeDropWizard.tsx`
- Remove the Special Instructions section from step 0 (Details)
- Add it to the Schedule/Delivery step (scheduleStepIndex) — this is the last config step before Review, so the user has full context about their drop by then
- Keep the seasonal preset auto-fill behavior intact (it still writes to `themeNotes`)

### Files
- `src/pages/CreativeDrops.tsx` — back button text
- `src/components/app/CreativeDropWizard.tsx` — remove redundant heading, fix placeholder, relocate Special Instructions

