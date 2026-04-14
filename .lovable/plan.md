<final-text>
Short Film audit complete. It is not fully fixed yet.

What I found
- The mobile floating bar is covering the bottom of the page content. Your screenshot confirms the last film cards get hidden behind it because `/app/video/short-film` no longer reserves bottom space.
- The floating bar still does not match the newer floating system used elsewhere: radius, blur, spacing, safe-area behavior, button height, and CTA wording are behind the standard.
- Film type cards still use emoji icons, which breaks the current brand/design system.
- Several important actions are functionally wrong:
  - `My Films -> View` ignores the project id and just sends users to `/app/video`.
  - completed short films are not reliably reopenable because the full restorable state is not always persisted on generate.
  - `Download All` opens one tab/download per clip, which can get popup-blocked and feels broken.
  - `showPreview` is local-only and is not reset cleanly on new film/load/reset.
- Completion logic is misleading:
  - `allDone` treats failed shots as “done”, so completion UI can appear even when shots failed.
  - project status is marked `complete` even if some shots fail, so list actions/statuses become inaccurate.
  - audio CTA can appear after failed video runs.
- Film type “defaults” are mostly not applied. The UI says film type sets defaults, but `defaultStructure` / `defaultTone` are not actually being applied in the workflow state.
- Touch/accessibility is still inconsistent:
  - many short-film card buttons lack shared focus-ring treatment
  - several icon buttons are too small for mobile touch targets
  - raw enum text/truncated labels still show in review states
- Step-specific responsive issues remain:
  - reference section headers crowd the Library button on smaller widths
  - library pickers use tiny 3-column mobile grids
  - shot cards/retry actions need better mobile layout
  - review summary and project list need cleaner mobile stacking
- There is also a React ref warning surfacing when this route mounts; if it is caused by this page wrapper path, I should clear it during the pass.

Implementation plan
1. Fix the workflow state and button behavior in `useShortFilmProject`
   - apply film-type defaults when a film type is chosen
   - split “finished” into real success vs partial failure states
   - only show audio/preview/completion actions when they actually make sense
   - persist a full reopenable project snapshot on generate
   - make completed projects reopen correctly from `My Films`
   - reset preview state correctly on reset/load/new run
   - replace blind insert behavior for project shots/inputs with safe replace/upsert logic
   - set project status from the real result, not always `complete`

2. Rebuild the page shell to match the current design system
   - add proper bottom spacing and safe-area handling so the floating bar never covers content
   - align the sticky bar to the Product Images floating pattern
   - use contextual CTA labels instead of generic “Next”
   - increase mobile touch targets to proper sizes
   - reuse the shared stepper pattern instead of maintaining a drifting duplicate

3. Clean up the visual system across every short-film step
   - replace emoji film icons with Lucide icons
   - add consistent focus-visible rings and aria labels to all interactive cards/buttons
   - fix reference section header stacking and mobile library picker grids
   - improve shot card layout, metadata wrapping, action sizing, and failed retry placement
   - clean review summary labels so users see proper names, not raw values/slugs
   - make project list rows/actions stack cleanly on mobile/tablet

4. Fix the remaining user-visible action quality issues
   - make “View/Open” actually reopen the correct short film
   - replace multi-tab `Download All` with a proper bundled download flow
   - keep reset/save/back/next behavior consistent across breakpoints
   - ensure every visible button has a real working outcome

Files I expect to touch
- `src/pages/video/ShortFilm.tsx`
- `src/hooks/useShortFilmProject.ts`
- `src/components/app/video/short-film/ShortFilmStickyBar.tsx`
- `src/components/app/video/short-film/ShortFilmStepper.tsx` or replace it with the shared catalog stepper
- `src/components/app/video/short-film/FilmTypeSelector.tsx`
- `src/components/app/video/short-film/ReferenceUploadPanel.tsx`
- `src/components/app/video/short-film/ShotCard.tsx`
- `src/components/app/video/short-film/ShotPlanEditor.tsx`
- `src/components/app/video/short-film/CustomStructureBuilder.tsx`
- `src/components/app/video/short-film/ShortFilmSettingsPanel.tsx`
- `src/components/app/video/short-film/ShortFilmProgressPanel.tsx`
- `src/components/app/video/short-film/ShortFilmReviewSummary.tsx`
- `src/components/app/video/short-film/ShortFilmProjectList.tsx`
- `src/components/app/video/short-film/ShortFilmVideoPlayer.tsx`
- `src/lib/shortFilmPlanner.ts`
- possibly the route wrapper path if the ref warning is confirmed to originate there

QA I will run after implementation
- test every button in every step
- test full flow on mobile, tablet, and desktop
- verify sticky bar never overlaps content
- verify save/resume/open completed film
- verify download, preview, reset, retry, and generation-failure states
- verify focus, touch targets, and keyboard navigation across the full short-film flow
</final-text>