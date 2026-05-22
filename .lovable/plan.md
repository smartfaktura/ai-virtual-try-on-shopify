## Remove "Jump to fix" from the sticky bar; surface missing-section feedback inline

### What the user wants
- Sticky bar should NOT contain a "Jump to fix" affordance — it looks out of place.
- The validation feedback (which section needs attention) should live inline near the actual missing section, not as a chip in the sticky bar.

### Changes

**1. `src/features/brand-scenes/wizard/WizardLayout.tsx`**
- Remove the `JumpButton` constant and the `ArrowDown` import.
- Restore the disabled `Next` button in the sticky bar when `nextDisabled`: render `NextButton` as the only primary action (wrapped in `DisabledTooltip` so hover still explains why). Clicking it keeps the existing `handleNextClick` behavior — scrolls to `[data-missing="1"]` — but the bar visually just shows `Back` + (disabled) `Next`.
- No reason chip, no jump button — the sticky bar stays clean.

**2. `src/features/brand-scenes/wizard/components/Section.tsx`**
- When `missing` is true, render a small inline notice under the section body:
  - `text-[11px] text-destructive/80 leading-relaxed` paragraph reading "This section is required to continue".
  - Strengthen the existing `missing` container: change `ring-1 ring-border` → `ring-1 ring-destructive/30` so the missing state is visible at a glance.
- Keep `data-missing="1"` intact so the sticky `Next` still scrolls here.

### Out of scope
- No changes to `BrandSceneWizard` reason strings or which fields are required.
- No copy beyond the single inline "required to continue" notice.
- No animation, color-token, or sticky-bar restructuring beyond the removal above.
