
Goal: make the Freestyle pills feel “packed and stable” on mobile even when labels change length, without horizontal scroll.

What I found
- The mobile chip rows in `FreestyleSettingsChips.tsx` still use `flex-wrap`.
- Even with truncated labels, wrap layout creates orphan pills (`Framing`, `Style`) and visible empty gaps.
- The current chip triggers are content-width based, so pill widths still vary by state (default vs selected), which causes visual reflow.

Proposed solution (better than wrap-only)
1) Switch mobile chip area to a deterministic grid layout (not horizontal scroll)
- Replace free-wrap rows with structured grids so pills fill lanes consistently:
  - Assets grid: 2 columns (`Upload`, `Product`, `Model`, `Scene`)
  - Settings grid: 3 columns (`Framing`, `Aspect`, `Quality/Pro`, `Camera`) + `Style` as full-width row
  - Advanced (inside collapsible): 2 columns (`Brand`, `Exclude`, `Polish`, `Presets`)
- Keep desktop layout unchanged.

2) Add a “full-width mobile trigger” mode to chip components
- Update these components to accept a `fullWidth` (or similar) prop:
  - `ProductSelectorChip.tsx`
  - `ModelSelectorChip.tsx`
  - `SceneSelectorChip.tsx`
  - `FramingSelectorChip.tsx`
  - `BrandProfileChip.tsx`
  - `NegativesChip.tsx`
- In that mode, trigger buttons use:
  - `w-full justify-between min-w-0`
  - label area `flex-1 min-w-0 truncate`
  - right-side controls/icons in `shrink-0`
- This makes each chip occupy its slot regardless of text length.

3) Normalize label behavior for changing content
- Remove fixed `max-w-[80px]` style dependency for selected labels in mobile mode.
- Use slot-based truncation (container-width truncation) so long names do not change layout footprint.

4) Make upload chip layout-consistent
- Ensure upload control visually behaves like other chips in mobile grid (same height/shape and full-width behavior in its slot) so it doesn’t create uneven packing.

Files to update
- `src/components/app/freestyle/FreestyleSettingsChips.tsx` (mobile layout structure: grid lanes, ordering, style trigger spanning full row)
- `src/components/app/freestyle/ProductSelectorChip.tsx` (full-width trigger mode)
- `src/components/app/freestyle/ModelSelectorChip.tsx` (full-width trigger mode)
- `src/components/app/freestyle/SceneSelectorChip.tsx` (full-width trigger mode)
- `src/components/app/FramingSelectorChip.tsx` (full-width trigger mode)
- `src/components/app/freestyle/BrandProfileChip.tsx` (full-width trigger mode for advanced row)
- `src/components/app/freestyle/NegativesChip.tsx` (full-width trigger mode for advanced row)
- `src/components/app/freestyle/FreestylePromptPanel.tsx` (upload chip consistency if needed)

Technical details
- Mobile-only classes will be applied under current mobile branch logic (`useIsMobile`), so desktop remains intact.
- Grid strategy removes whitespace caused by odd flex wrapping and content-driven widths.
- Slot-based truncation guarantees stability when selected names change over time.
- No backend/data changes required.

Validation checklist after implementation
- 390px viewport: no large empty gaps between pills.
- Select long product/model/scene names: layout stays stable.
- Toggle `Pro Model` lock state: no row jump.
- Open/close Style collapsible and change active count badge: no broken alignment.
- Desktop pills remain as current design.
