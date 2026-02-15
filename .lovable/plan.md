

## Fix: Wizard-to-Generation Data Flow Mismatches

After examining the full pipeline (wizard save -> `scene_config` DB column -> generation trigger -> `generate-workflow` edge function), there are several mismatches that will cause errors or silently wrong behavior when Creative Drops actually fire.

---

### Issues Found

**1. `selected_scenes` saves labels, but `generate-workflow` expects numeric indices**

The wizard saves scene selections as label strings (e.g., `["Summer", "Autumn"]`) in `scene_config[wfId].selected_scenes`. But the `generate-workflow` edge function expects `selected_variations` as an array of numeric indices (`[0, 2]`) that map into `config.variation_strategy.variations[]`. When the drop runner eventually passes these labels to the function, it will either ignore them (generating ALL variations) or error out.

**Fix**: Convert label-based selections to numeric indices before saving, OR convert them at trigger time. The cleanest approach is to save as indices in the wizard:

```typescript
// In saveMutation, convert scene labels to variation indices
const wf = workflows.find(w => w.id === id);
const variations = wf?.generation_config?.variation_strategy?.variations || [];
const selectedLabels = Array.from(workflowSceneSelections[id] || []);
const selectedIndices = selectedLabels
  .map(label => variations.findIndex(v => v.label === label))
  .filter(i => i >= 0);

sceneConfig[id] = {
  aspect_ratio: workflowFormats[id] || '1:1',
  selected_variation_indices: selectedIndices, // numeric indices
  selected_scenes: selectedLabels, // keep for display
  ...
};
```

**2. `model_ids` saved but `generate-workflow` expects a single `model` object**

The wizard saves `model_ids: ["model_1", "model_2", ...]` (string IDs from mock/custom models). But `generate-workflow` expects a single `model` object with `{ name, gender, ethnicity, bodyType, ageRange, imageUrl }`. There is NO code that resolves model IDs to their full model objects before calling the function. When the drop runs, no model data will be passed, and model-dependent workflows (Virtual Try-On, Mirror Selfie, UGC) will generate without any model reference -- producing wrong results.

**Fix**: The drop trigger code (which doesn't exist yet but will need to) must resolve each model ID to its full object. For now, ensure the wizard saves enough model metadata in `scene_config` so it can be resolved later:

```typescript
// Save full model objects instead of just IDs
const resolvedModels = (workflowModelSelections[id] || []).map(mId => {
  const m = allModels.find(am => am.id === mId);
  return m ? { id: m.id, name: m.name, image_url: m.image_url } : null;
}).filter(Boolean);

sceneConfig[id] = {
  ...
  models: resolvedModels, // full objects for generation
  model_ids: workflowModelSelections[id] || [], // IDs for display
};
```

**3. `pose_ids` saved but never consumed by any edge function**

The wizard saves `pose_ids` for Virtual Try-On, but `generate-workflow` has no handling for pose data. The poses from `mockTryOnPoses` have properties like `category`, `poseName`, `previewUrl` -- none of which are mapped into the generation prompt. This data will be silently ignored.

**Fix**: For now, this is acceptable as a future feature. Add a comment in the save payload noting that pose integration requires a future `generate-workflow` update. No code change needed now, but flag it clearly.

**4. `custom_settings` saved but never injected into generation prompts**

The wizard lets users pick custom settings like "Mood" for UGC workflows. These are saved as `{ "Mood": "excited" }` in `scene_config`. But `generate-workflow` only receives `ugc_mood` as a top-level field in the request body. There's no mapping from `custom_settings.Mood` to `ugc_mood`.

**Fix**: Add a mapping layer in the save payload or document that the drop trigger must translate:

```typescript
// Map known custom settings to generate-workflow request fields
const settingsMap: Record<string, string> = {
  'Mood': 'ugc_mood',
  'Prop Style': 'prop_style',
  'Styling': 'styling_notes',
};
```

**5. Top-level `model_ids` in payload is the OLD global array (always empty)**

Line 301: `model_ids: selectedModelIds` -- this is the old global `selectedModelIds` state which is never populated (per-workflow model selections replaced it). This saves an empty array, losing model data for the schedule.

**Fix**: Remove the top-level `model_ids` or populate it as a union of all per-workflow model selections:

```typescript
// Gather all unique model IDs across workflows
const allSelectedModelIds = Array.from(new Set(
  Array.from(selectedWorkflowIds).flatMap(id => workflowModelSelections[id] || [])
));
// ...
model_ids: allSelectedModelIds,
```

**6. No validation that model-required workflows have models selected**

Workflows like Virtual Try-On and Mirror Selfie require a model. The wizard allows proceeding to Step 4 and saving without selecting any models. When the drop fires, the generation will produce images without model identity, which is incorrect for those workflow types.

**Fix**: Add validation in `canNext()` for Step 2 (Workflows):

```typescript
case 2: {
  if (selectedWorkflowIds.size === 0) return false;
  // Check model-required workflows have at least one model
  for (const wfId of selectedWorkflowIds) {
    const wf = workflows.find(w => w.id === wfId);
    if (wf?.uses_tryon || wf?.generation_config?.ui_config?.show_model_picker) {
      if (!workflowModelSelections[wfId]?.length) return false;
    }
  }
  return true;
}
```

---

### Files Modified

- **`src/components/app/CreativeDropWizard.tsx`**
  - Fix save payload: convert scene labels to variation indices
  - Fix save payload: save resolved model objects (not just IDs)
  - Fix top-level `model_ids` to aggregate per-workflow selections
  - Add Step 3 validation for model-required workflows
  - Add validation hint message for missing model selections

- **`src/lib/dropCreditCalculator.ts`** -- no changes needed

- **`src/pages/CreativeDrops.tsx`** -- no changes needed (hydration logic already handles the fields)

### Not Fixed Now (Future Work)

- Pose integration into `generate-workflow` prompts (requires edge function update)
- Custom settings mapping to generation request fields (requires drop trigger code)
- The actual "drop trigger" service that reads `creative_schedules` and dispatches per-product, per-workflow generation jobs does not exist yet -- these fixes ensure the saved data is correct for when it does

