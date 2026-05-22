## Replace error chip with a "Jump to missing" button

### Current behavior
When `nextDisabled` and a `nextDisabledReason` exist, `WizardLayout` renders a lock-icon chip with the reason text (e.g. "Pick how the cast holds, wears, or stands next to the product") inside the sticky bar. The Next button already silently scrolls to `[data-missing="1"]` when clicked while disabled, but the affordance is hidden.

### Change
**File:** `src/features/brand-scenes/wizard/WizardLayout.tsx`

1. **Remove** the reason chip block (lines 167–177) — no more inline error text in the sticky bar.
2. **Replace** the disabled `Next` button (when `nextDisabled && nextDisabledReason && !isLastStep`) with a secondary action: a `Button size="pill" variant="outline"` labeled `Jump to fix` (with `ArrowDown` icon from `lucide-react`) that calls the existing `handleNextClick` (which already scrolls to `[data-missing="1"]`). Keep the tooltip wrapper so hovering still surfaces the reason for users who want it.
3. When `!nextDisabled`, keep the current primary `Next` button unchanged.
4. Apply to both mobile and desktop branches.

### Out of scope
- No changes to `BrandSceneWizard` reason strings, `Section` `data-missing` logic, or any step files.
- No copy changes beyond the new button label.
