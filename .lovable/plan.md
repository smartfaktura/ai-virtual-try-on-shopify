

## Creative Drops Wizard — Split Workflow Selection & Configuration

### Current Problem
Step 3 combines workflow selection AND all per-workflow configuration (scenes, models, formats, settings) into one long scrolling page with nested collapsible sections. This is cluttered, hard to navigate, and buries important choices.

### New Flow

**Step 3: "Select Workflows"** — Simple checklist of available workflows. Just pick which ones you want. No configuration here at all. Clean cards with checkbox, name, description. That's it.

**Step 3b → 3c → 3d...: "Configure [Workflow Name]"** — After clicking Next, the wizard enters a per-workflow configuration sub-flow. Each selected workflow gets its own full-page step. A progress indicator shows "Configuring 1 of 3" etc.

**What each workflow config page shows (full page, no inner scroll):**

For all workflows:
- **Formats** — multi-select chips (1:1, 4:5, 9:16, 16:9)

For workflows with scenes/variations (Product Listing, Flat Lay, etc.):
- **Scenes** — full grid with Random toggle and Select All, no collapsible wrapper
- Scene images displayed at a comfortable size

For workflows needing models (Virtual Try-On, etc.):
- **Models** — full grid with Random toggle, no collapsible
- **Scene Library / Poses** — if `show_pose_picker` is true

For workflows with custom settings (Selfie/UGC):
- **Custom Settings** — chip selectors for Mood, Prop Style, etc., shown inline

**Progress bar** at the top of the wizard showing overall completion across all steps. E.g. a thin bar or fraction like "Step 4 of 7" (Details, Products, Select Workflows, Config WF1, Config WF2, Schedule, Review).

### Implementation

The key change: `STEPS` becomes dynamic based on selected workflows. Instead of a fixed 5-step array, we compute steps after workflow selection.

**State changes:**
- Add `configIndex` state (0-based index into selectedWorkflows array) to track which workflow is being configured
- Modify `step` logic: steps 0-2 remain (Details, Products, Workflow Selection). Steps 3..3+N-1 are per-workflow config. Then Schedule and Review follow.
- Compute `totalSteps` dynamically: `3 + selectedWorkflowIds.size + 2`

**Step rendering:**
- `step === 2`: Workflow selection only (simple grid of workflow cards with checkboxes)
- `step >= 3 && step < 3 + selectedWorkflows.length`: Render full-page config for `selectedWorkflows[step - 3]`
- `step === 3 + selectedWorkflows.length`: Schedule step
- `step === 4 + selectedWorkflows.length`: Review step

**Progress bar:**
- Thin horizontal bar at top showing `(currentStep / totalSteps) * 100%`
- Label like "Configure Virtual Try-On Set (2 of 3 workflows)"

**Validation per config step:**
- Each workflow config step validates: scenes selected (or random), models selected (or random) if needed
- Format defaults to `['1:1']` — always valid

**Full-page layout for each workflow config:**
- No collapsibles — all sections stacked vertically with clear headers
- Scenes grid uses full width, 4-5 columns
- Models grid uses full width
- No max-height or overflow-y-auto on inner containers

### Files Changed

| File | Change |
|------|--------|
| `src/components/app/CreativeDropWizard.tsx` | Restructure step logic to dynamic steps, split workflow selection from config, add progress bar, render full-page per-workflow config |

