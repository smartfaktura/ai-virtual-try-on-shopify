

## Creative Drops Wizard -- Per-Workflow Scene, Model & Settings Configuration

The current wizard Step 3 ("Workflows") only lets users toggle workflows on/off and pick an aspect ratio. But each workflow has its own scenes (up to 30), model requirements, and custom settings that users can't configure. This upgrade adds inline, expandable per-workflow configuration panels.

---

### Current State

| Workflow | Scenes | Models | Custom Settings |
|----------|--------|--------|-----------------|
| Virtual Try-On Set | 4 angle variations | Yes (model + pose picker) | None |
| Product Listing Set | 30 scene variations | No | Product Angles (Front Only / Front+Side / Front+Back / All Angles) |
| Selfie / UGC Set | 16 situation variations | Yes (model picker) | None |
| Flat Lay Set | 12 layout variations | No | None |
| Mirror Selfie Set | 30 environment variations | Yes (model picker) | None |

None of this is exposed in the Creative Drops wizard today.

---

### What Changes

**Step 3 of the wizard gets expanded.** When a user selects a workflow, the card expands to reveal a collapsible configuration panel with:

1. **Scene/Variation Picker** -- A thumbnail grid of the workflow's variation scenes (from `generation_config.variation_strategy.variations`). Users can multi-select which scenes they want included. Each scene shows its preview image and label. "Select All" / "Deselect All" toggles provided. Scenes that have `preview_url` show the image; others show a gradient placeholder with the label.

2. **Model Picker** (only for workflows with `uses_tryon: true` or `show_model_picker: true`) -- The existing model grid but scoped per-workflow. Users pick which models to use for that specific workflow rather than globally. This replaces the current global model picker below all workflows.

3. **Custom Settings** (from `generation_config.ui_config.custom_settings`) -- Rendered dynamically based on `type`:
   - `select` type: renders a row of pill buttons (same pattern as aspect ratio chips)
   - Only Product Listing Set currently has this (Product Angles selector)

4. **Aspect Ratio** -- Stays as-is (already per-workflow).

**Layout for expanded workflow card:**

```text
+---------------------------------------------------------------+
| [thumb] Virtual Try-On Set              [Model badge]  [check]|
|         Generate try-on images...                             |
|                                                               |
|  Format: [1:1] [4:5] [9:16] [16:9]                          |
|                                                               |
|  Scenes  (2 of 4 selected)                    [Select All]   |
|  [Front View] [3/4 Turn] [Back View] [Movement Shot]         |
|                                                               |
|  Models  (3 selected)                         [Clear]        |
|  [avatar] [avatar] [avatar] [avatar] [avatar] ...            |
+---------------------------------------------------------------+
```

---

### Data Model Changes

**No new database columns needed.** The existing `scene_config` JSONB column and `model_ids` array will be restructured:

- `scene_config` changes from `{ workflowId: { aspect_ratio } }` to `{ workflowId: { aspect_ratio, selected_scenes: string[], custom_settings: Record<string, string> } }`
- `model_ids` stays as a flat array (global fallback), but `scene_config[workflowId].model_ids` can optionally store per-workflow model selections

Since `scene_config` is JSONB, this is backward-compatible -- no migration needed.

---

### Technical Details

**File: `src/components/app/CreativeDropWizard.tsx`**

Changes to Step 3 (lines 483-652):

1. **New state**: `workflowSceneSelections: Record<string, Set<string>>` -- tracks selected scene labels per workflow. `workflowModelSelections: Record<string, string[]>` -- tracks selected model IDs per workflow. `workflowCustomSettings: Record<string, Record<string, string>>` -- tracks custom settings per workflow.

2. **Fetch variation data**: The `workflows` query already fetches full workflow data including `generation_config`. Extract `variation_strategy.variations` from each workflow to populate the scene picker.

3. **Expanded workflow card**: When a workflow is selected (`isSelected === true`), render a collapsible section below the aspect ratio chips containing:
   - Scene grid: `grid grid-cols-4 sm:grid-cols-5 gap-2` with small thumbnail cards. Each card shows `preview_url` image (or gradient placeholder) + label. Multi-select with checkmark overlay. Header row shows count + "Select All" toggle.
   - Model grid (conditional): Same as current model grid but only shown inline under workflows that need models. `grid grid-cols-5 sm:grid-cols-8 gap-2` with smaller avatars.
   - Custom settings: Rendered from `ui_config.custom_settings` array. For `type: 'select'`, render horizontal pill buttons.

4. **Remove global model picker**: The current `needsModelPicker` section (lines 558-596) is removed. Model selection moves inside each workflow's expanded panel.

5. **Save payload update**: When saving, construct `scene_config` as:
```typescript
const sceneConfig: Record<string, any> = {};
selectedWorkflowIds.forEach(id => {
  sceneConfig[id] = {
    aspect_ratio: workflowFormats[id] || '1:1',
    selected_scenes: Array.from(workflowSceneSelections[id] || []),
    model_ids: workflowModelSelections[id] || [],
    custom_settings: workflowCustomSettings[id] || {},
  };
});
```

6. **Review step update**: Show per-workflow scene count, model count, and custom settings in the summary.

7. **Initial data hydration**: When editing/duplicating, parse `scene_config` to restore `workflowSceneSelections`, `workflowModelSelections`, and `workflowCustomSettings` from the saved JSONB.

**File: `src/pages/CreativeDrops.tsx`**

- Update `extractWfFormats` to handle the new `scene_config` structure (backward compatible -- check for both old and new format).
- Update `handleEdit` / `handleDuplicate` to pass `workflowSceneSelections`, `workflowModelSelections`, and `workflowCustomSettings` in `initialData`.

**File: `src/components/app/CreativeDropWizard.tsx` -- `CreativeDropWizardInitialData` interface**

Add new optional fields:
```typescript
workflowSceneSelections?: Record<string, string[]>;
workflowModelSelections?: Record<string, string[]>;
workflowCustomSettings?: Record<string, Record<string, string>>;
```

---

### UX Details

- Scene thumbnails are small (64x64 on mobile, 80x80 on desktop) to keep the panel compact
- Scene grid scrolls vertically if more than 2 rows (`max-h-[200px] overflow-y-auto`)
- Default behavior: all scenes selected when a workflow is first toggled on (user deselects what they don't want)
- Model avatars are small circles (40x40) in a dense grid
- The entire per-workflow config is wrapped in a subtle `bg-muted/30 rounded-xl p-4` container for visual grouping
- Smooth `animate-fade-in` on expand
