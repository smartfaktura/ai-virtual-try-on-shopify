

# Short Film UI/UX Audit -- All Issues & Fixes

## Issues Found

### 1. Bottom Bar Uses Fixed/Sticky Border-Top (Old School)
**Current:** `fixed bottom-0 left-0 right-0 bg-background/95 border-t` -- a full-width fixed bar pinned to the viewport bottom with a top border.
**Product Images pattern:** `sticky bottom-4` with a floating `rounded-xl border bg-card/95 backdrop-blur-sm shadow-lg` card. Includes step dots, credit count, context summary, and responsive mobile/desktop layouts.

**Fix:** Replace the entire bottom nav in `ShortFilm.tsx` with a new `ShortFilmStickyBar` component that mirrors `ProductImagesStickyBar` -- floating rounded card with `sticky bottom-4`, step progress dots, shot/credit summary, mobile-stacked layout, and desktop single-row layout. Remove the `pb-24` padding hack on the page container.

### 2. Stepper Is Inconsistent with CatalogStepper
**Current:** `ShortFilmStepper` is a flat row of numbered circles with hidden labels on mobile. No icons, no click-to-navigate, no progress bar on mobile, no check marks for completed steps.
**Product Images pattern:** `CatalogStepper` has icons per step, click-to-navigate with `canNavigateTo`, check marks for done steps, pill-style active states, and a mobile-specific icon-only layout with a progress bar underneath.

**Fix:** Refactor `ShortFilmStepper` to use `CatalogStepper` directly (or match its pattern). Add icons for each step (Film, Image, BookOpen, LayoutGrid, Settings, Play). Support `onStepClick` + `canNavigateTo` for non-linear navigation. Add mobile progress bar.

### 3. ShotCard Edit/Delete Buttons Are hover-only (Broken on Touch)
**Current:** `opacity-0 group-hover:opacity-100` -- edit and delete buttons are invisible and inaccessible on mobile/tablet since there is no hover.
**Fix:** Always show action buttons on mobile (`opacity-100 sm:opacity-0 sm:group-hover:opacity-100`), or move them into a kebab menu / swipe action.

### 4. CustomStructureBuilder Reorder Buttons Are hover-only (Broken on Touch)
**Current:** Same `opacity-0 group-hover:opacity-100` pattern on move/delete buttons.
**Fix:** Same approach -- always visible on mobile.

### 5. Audio Grid 5-Column Layout Breaks on Mobile
**Current:** `grid grid-cols-5` for audio options. On small screens (320-414px), 5 columns means ~60px per option -- text overflows and icons get crushed.
**Fix:** Use `grid grid-cols-3 sm:grid-cols-5` so mobile gets a readable 3-column layout.

### 6. Aspect Ratio Grid: 4 Columns on Mobile Is Tight
**Current:** `grid grid-cols-4` for aspect ratio options. At 320px, each cell is ~70px.
**Fix:** Use `grid grid-cols-2 sm:grid-cols-4` for comfortable tap targets on small screens.

### 7. ShotPlanEditor Toolbar Overflows on Mobile
**Current:** Header row has "Shot Plan" text + Auto/AI toggle + Add Shot button + Regenerate button all in a single `flex` row. This overflows on small screens.
**Fix:** Stack the toolbar: title on top, action buttons below in a wrapping row. Use `flex-wrap` or a two-row layout on mobile.

### 8. Film Type Cards: 2x4 Grid Leaves Dead Space on Mobile
**Current:** `grid-cols-2 sm:grid-cols-4`. On narrow screens, 2 columns works but descriptions are clipped (`line-clamp-2`). This is acceptable but the cards are short -- could use `grid-cols-1 sm:grid-cols-2 md:grid-cols-4` for single-column on smallest screens.
**Fix:** Keep as-is or shift to `grid-cols-1 xs:grid-cols-2 sm:grid-cols-4` for the narrowest screens.

### 9. Review Step -- "Generate Short Film" Button Disappears During/After Generation
**Current:** The bottom bar is hidden when `isGenerating` is true (`!(step === 'review' && isGenerating)`). But once generation finishes, `isGenerating` becomes false and the bar reappears showing "Generate Short Film" again -- which would re-trigger generation. There is no "New Film" or "Start Over" action in the floating bar after completion.
**Fix:** Post-completion, show a "New Film" / "Start Over" button in the floating bar instead of re-showing "Generate Short Film". Also show "Download All" in the bar when complete.

### 10. No Loading/Skeleton State for Project List
**Current:** Returns `null` while loading. User sees nothing then content pops in.
**Fix:** Show a subtle skeleton while loading.

### 11. Reference Upload Remove Button Is hover-only on Mobile
**Current:** `opacity-0 group-hover:opacity-100` on the red X button to remove uploaded references.
**Fix:** Always show on touch devices.

## Files to Change

| File | Changes |
|------|---------|
| `src/pages/video/ShortFilm.tsx` | Replace fixed bottom bar with floating `ShortFilmStickyBar`, remove `pb-24`, add post-generation bar states, use `CatalogStepper` or refactored stepper |
| `src/components/app/video/short-film/ShortFilmStepper.tsx` | Refactor to match `CatalogStepper` pattern with icons, click nav, mobile progress bar -- or delete and use `CatalogStepper` directly |
| `src/components/app/video/short-film/ShotCard.tsx` | Fix hover-only buttons for mobile |
| `src/components/app/video/short-film/CustomStructureBuilder.tsx` | Fix hover-only buttons for mobile |
| `src/components/app/video/short-film/ShortFilmSettingsPanel.tsx` | Fix audio 5-col and aspect ratio 4-col grids for mobile |
| `src/components/app/video/short-film/ShotPlanEditor.tsx` | Fix toolbar overflow on mobile |
| `src/components/app/video/short-film/ReferenceUploadPanel.tsx` | Fix hover-only remove button for mobile |
| `src/components/app/video/short-film/ShortFilmProjectList.tsx` | Add skeleton loading state |
| NEW: `src/components/app/video/short-film/ShortFilmStickyBar.tsx` | New floating bar component matching `ProductImagesStickyBar` pattern |

## Implementation Order
1. Create `ShortFilmStickyBar` (floating bar with step dots, credits, mobile/desktop layouts)
2. Refactor `ShortFilmStepper` to match `CatalogStepper` (icons, click-nav, mobile progress)
3. Update `ShortFilm.tsx` to use new bar + stepper, remove `pb-24` and fixed bar
4. Fix all hover-only touch issues (ShotCard, CustomStructureBuilder, ReferenceUploadPanel)
5. Fix responsive grid breakpoints (Settings audio/aspect, ShotPlanEditor toolbar)
6. Add post-generation bar states and skeleton loading for project list

