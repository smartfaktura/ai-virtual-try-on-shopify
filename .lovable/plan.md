

# Move "Recent Creations" Below "Choose What to Create"

## Problem
Currently the layout order is: Activity → Recent Creations → CHOOSE WHAT TO CREATE → Workflow cards. The user wants Recent Creations to appear **after** the workflow catalog section.

## Changes

### `src/pages/Workflows.tsx`

**Reorder the sections inside the `hasActivity` block (lines 494-520):**
1. Keep Activity cards (WorkflowActivityCard) at the top
2. Move "CHOOSE WHAT TO CREATE" divider right after the activity cards
3. Move "Recent Creations" label + `WorkflowRecentRow` to **after** the workflow catalog grid (after line 588)
4. The Recent Creations section should render independently of `hasActivity` — always show it if there are recent jobs, placed after the workflow cards

**Resulting layout order:**
```text
Activity (if any active/completed/failed batches)
CHOOSE WHAT TO CREATE divider
Workflow catalog cards
Recent Creations (label + row + "View All" button)
```

### Files changed
- `src/pages/Workflows.tsx` — reorder sections only, no logic changes

