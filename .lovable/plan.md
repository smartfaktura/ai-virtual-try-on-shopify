

# Rework: Creative Drops Wizard — Single Workflow Per Drop (Frontend Only)

## What Changes

The wizard currently allows multi-workflow selection, creating dynamic config steps per workflow. This is confusing and error-prone. We simplify to **1 workflow per drop** and merge selection + configuration into a single step.

### Current Flow (6+ dynamic steps)
```text
Details → Products → Select Multiple Workflows → Config WF1 → Config WF2 → ... → Delivery → Review
```

### New Flow (4 fixed steps)
```text
Details → Products → Workflow (select + configure) → Launch (delivery + review merged)
```

## File: `src/components/app/CreativeDropWizard.tsx` (single file, ~1982 lines)

### A. Simplify State (lines 161-214)
- `selectedWorkflowIds: Set<string>` → `selectedWorkflowId: string | null`
- Remove all per-workflow `Record<string, ...>` maps (`workflowSceneSelections`, `workflowModelSelections`, `workflowPoseSelections`, `workflowCustomSettings`, `imagesPerWorkflow`, `workflowProductIds`, `workflowFormats`, `randomModels`, `randomScenes`, `customImageCounts`)
- Replace with flat state: `sceneSelections: Set<string>`, `modelSelections: string[]`, `poseSelections: string[]`, `customSettings: Record<string, string>`, `imageCount: number`, `formats: string[]`, `isRandomModels: boolean`, `isRandomScenes: boolean`

### B. Fix Step Calculation (lines 301-310)
- Remove dynamic `configStepCount`. Fixed 4 steps: `totalSteps = 4`
- Step 0: Details, Step 1: Products, Step 2: Workflow, Step 3: Launch
- Remove `isConfigStep`, `configWorkflowIndex`, `configWorkflow` — replaced by checking `step === 2`
- Stepper labels: `['Details', 'Products', 'Workflow', 'Launch']`

### C. Step 2: Merge Select + Configure (lines 914-1587)
- **Top section**: Workflow card grid (single-select — clicking one deselects previous). Same cards as current step 2 but with radio-style selection instead of checkbox
- **Below (when workflow selected)**: Show the full config panel inline — scenes, models, poses, formats, image count, custom settings. This is the exact same UI as current config steps (lines 1032-1587) but without the per-workflow `wf.id` key lookups — just uses flat state directly
- Remove the separate config step rendering entirely

### D. Step 3: Merge Delivery + Review (lines 1589-1924)
- Combine the Schedule/Delivery section and the Review section into one scrollable step called "Launch"
- Show delivery options at top, then review summary below, then the submit button

### E. Update Validation (lines 358-406)
- Step 2: `selectedWorkflowId !== null` + scene/model requirements (same logic as current `isConfigStep` validation but on flat state)
- Step 3: delivery validation (same as current `scheduleStepIndex`)

### F. Update Save Logic (lines 426-562)
- Build `sceneConfig` with single workflow entry: `{ [selectedWorkflowId]: { ... } }`
- `workflow_ids` becomes `[selectedWorkflowId]`
- All config reads from flat state instead of `Record<string, ...>[wf.id]`

### G. Update Credit Calculation (lines 328-343)
- Single `WorkflowCostConfig` instead of mapping over `selectedWorkflowsList`

### H. Update `CreativeDropWizardInitialData` interface (lines 70-90)
- `selectedWorkflowIds: string[]` → keep as array for DB compat but only use `[0]`
- Remove per-workflow map types, add flat equivalents

## What's NOT Changing
- Database schema — `workflow_ids` stays as array, `scene_config` stays as JSON
- Backend edge functions — no changes
- Step 0 (Details) — keep as-is with all the recent UX improvements
- Step 1 (Products) — keep as-is
- The Freestyle prompts section moves into the Workflow step as a collapsible

## Estimated Impact
- ~400 lines removed (multi-workflow maps, dynamic step indexing, per-workflow config loops)
- ~100 lines simplified (flat state instead of keyed lookups)
- Net reduction of ~300 lines

