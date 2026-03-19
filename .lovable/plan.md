

## Fix Workflow Credit Calculation (Frontend)

The backend correctly charges **6 credits per image** for all workflows. But the frontend has wrong per-image costs, causing incorrect totals and misleading display text.

### Problems Found

| Location | Current | Should Be |
|----------|---------|-----------|
| `Generate.tsx:1657` | `quality === 'high' ? 6 : 4` | Always `6` |
| `WorkflowSettingsPanel.tsx:776` | `quality === 'high' ? 8 : 4` credits | `6` credits |
| `WorkflowSettingsPanel.tsx:622` | `quality === 'high' ? 16 : 8` credits | `6` credits |

The user sees "3 scenes × 8 credits = 6" which is doubly wrong — wrong per-image cost and wrong total.

### Fix

**File: `src/pages/Generate.tsx`** (line 1657)
- Change `workflowCostPerImage` to always be `6` for workflows

**File: `src/components/app/generate/WorkflowSettingsPanel.tsx`**
- Line 622: Change display from `quality === 'high' ? 16 : 8` to `6`
- Line 776: Change display from `quality === 'high' ? 8 : 4` to `6`

Result: "3 scenes × 6 credits" → Total: 18 credits (matching backend)

