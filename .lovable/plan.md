

## Creative Drops Wizard — Better Defaults & Granular Configuration

### Problems
1. **All scenes auto-selected** when a workflow is clicked (line 814-818 selects ALL variations)
2. **No guided per-workflow configuration step** — scenes/models/formats are crammed into collapsible sections inside the workflow selection card, making it hard to configure each workflow properly
3. **Formats default to 1:1** which is fine, but the multi-select nature invites over-selection without understanding cost implications

### Changes

**File: `src/components/app/CreativeDropWizard.tsx`**

**1. Don't auto-select all scenes on workflow selection**
- Line 814-818: Change the auto-selection logic so when a workflow is first selected, it initializes an **empty** scene set instead of selecting all variations
- Users must explicitly pick their scenes (or toggle "Random/Diverse")

**2. Don't auto-expand the first section on workflow click**
- Lines 820-829: Remove the auto-expand logic. Let users click into each workflow's configuration at their own pace after selecting it

**3. Default formats to only `1:1`** (already the case via `getWorkflowFormats` fallback — no change needed)

**4. Add a validation hint for empty scene selections**
- In `canNext()` (line 278-291): Add a check that each selected workflow with scenes has at least one scene selected (or Random enabled)
- In `getValidationHint()`: Show which workflow needs scene configuration

**5. Add a subtle "Configure" prompt on newly selected workflows**
- When a workflow is selected but has 0 scenes chosen and random is off, show a small amber "Configure scenes →" hint below the workflow card to guide the user

### Summary of behavior changes
- Selecting a workflow no longer auto-selects all scenes — starts empty
- Validation prevents advancing without configuring scenes per workflow
- A visual hint nudges users to configure each workflow
- Formats still default to 1:1 only (unchanged)
- Models still start unselected (unchanged)

### Files Changed — 1 file
| File | Change |
|------|--------|
| `src/components/app/CreativeDropWizard.tsx` | Remove auto-select-all-scenes, add scene validation, add configure hint |

