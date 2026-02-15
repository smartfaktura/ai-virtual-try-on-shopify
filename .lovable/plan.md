

## Creative Drops Wizard -- Fix Per-Workflow Configuration

Multiple issues need fixing in Step 3 of the wizard. Here is the full breakdown and the plan.

---

### Issues Found

1. **Auto-selects all scenes**: When a workflow is toggled on, all scenes are pre-selected (line 539). Users should start with none selected and choose what they want.

2. **No model picker showing for model workflows**: The model grid only queries `custom_models` table (which is likely empty). It needs to also include the 40+ mock models from `mockModels` so users always have models to pick from.

3. **Virtual Try-On missing pose/scene picker**: The Virtual Try-On workflow has `show_pose_picker: true` in its config, meaning it should show the fashion scene library (from `mockTryOnPoses`), but the wizard only shows its 4 angle variations. It needs a scene selector from the pose library.

4. **Flat Lay Set unclear**: Has `lock_aspect_ratio: true` but no UI indication about whether props are combined with the product. Needs a clarifying note.

5. **Mirror Selfie Set missing model picker**: Has `show_model_picker: true` but `uses_tryon: false`, so the `needsModels` check may pass but the empty `custom_models` query returns nothing useful.

6. **Laggy loading**: Scene images load without shimmer placeholders, causing visual jank.

7. **No credit calculator visible in Step 3**: Credit cost only shows in Step 4. It should appear as a sticky bar in Step 3 that updates as scenes/models are selected.

8. **Review step missing per-workflow details**: Doesn't show which specific scenes or models were picked per workflow.

---

### What Changes

**File: `src/components/app/CreativeDropWizard.tsx`**

**A. Fix scene auto-selection (line 536-540)**

When a workflow is first selected, initialize with an empty Set instead of all variations:

```typescript
// Before: new Set(variations.map(v => v.label))
// After: new Set<string>()
```

**B. Add mock models to the model picker**

Import `mockModels` from `@/data/mockData` and merge with custom models from the database:

```typescript
import { mockModels } from '@/data/mockData';

// In the model grid, use:
const allModels = [...mockModels.map(m => ({
  id: m.modelId,
  name: m.name,
  image_url: m.previewUrl,
})), ...models];
```

This ensures the model grid always has 40+ models available even when no custom models exist.

**C. Add pose/scene picker for Virtual Try-On**

Import `mockTryOnPoses` and filter to fashion-relevant categories. When `show_pose_picker` is true, render a scene grid from the pose library (in addition to the 4 angle variations which stay as-is):

```typescript
import { mockTryOnPoses, poseCategoryLabels } from '@/data/mockData';

// Inside the expanded workflow config, after the angle variations:
{uiConfig?.show_pose_picker && (
  <div className="space-y-2">
    <p className="text-xs font-medium">Scene / Environment</p>
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto">
      {fashionPoses.map(pose => (
        // Same selection UI as scene cards
      ))}
    </div>
  </div>
)}
```

This stores selected pose IDs in a new `workflowPoseSelections` state map, included in `scene_config` when saving.

**D. Add Flat Lay clarification note**

When Flat Lay is expanded, show a small info note:

```tsx
{wf.name === 'Flat Lay Set' && (
  <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
    Each layout includes curated styling props arranged around your product.
    The AI selects contextual props based on your product type.
  </p>
)}
```

Also, since `lock_aspect_ratio` is true for Flat Lay, hide the aspect ratio selector and show a fixed "1:1" badge instead.

**E. Add sticky credit calculator bar to Step 3**

Add a compact credit summary bar at the bottom of the Step 3 content area that updates live:

```tsx
{step === 2 && selectedWorkflowIds.size > 0 && (
  <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t pt-3 pb-1 -mx-1 px-1">
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <span className="font-medium">Estimated Cost</span>
      </div>
      <span className="font-semibold">{costEstimate.totalCredits} credits / drop</span>
    </div>
    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
      {costEstimate.breakdown.map(b => (
        <span key={b.workflowId}>{b.workflowName}: {b.subtotal}cr</span>
      ))}
    </div>
  </div>
)}
```

**F. Fix credit calculation to use per-workflow model selections**

Currently `workflowConfigs` only checks global `selectedModelIds` for `hasModel`. Update to check `workflowModelSelections[wf.id]` instead:

```typescript
const workflowConfigs: WorkflowCostConfig[] = workflows
  .filter(w => selectedWorkflowIds.has(w.id))
  .map(w => ({
    workflowId: w.id,
    workflowName: w.name,
    hasModel: w.uses_tryon || (workflowModelSelections[w.id]?.length > 0),
    hasCustomScene: false,
  }));
```

**G. Add shimmer loading for scene thumbnails**

Import `ShimmerImage` and use it for scene preview images instead of raw `<img>` tags to prevent laggy loading:

```tsx
import { ShimmerImage } from '@/components/ui/shimmer-image';

// Replace <img src={v.preview_url}> with:
<ShimmerImage src={v.preview_url} alt={v.label} className="w-full h-full object-cover" />
```

**H. Update Review step to show per-workflow details**

Show the specific selected scenes and models per workflow:

- List selected scene names as small badges under each workflow
- Show model thumbnails for workflows with models selected
- Show custom settings values

**I. Update save payload**

Include `pose_ids` in `scene_config` for Virtual Try-On:

```typescript
sceneConfig[id] = {
  aspect_ratio: workflowFormats[id] || '1:1',
  selected_scenes: Array.from(workflowSceneSelections[id] || []),
  pose_ids: workflowPoseSelections[id] || [],
  model_ids: workflowModelSelections[id] || [],
  custom_settings: workflowCustomSettings[id] || {},
};
```

---

### Technical Details

**New imports needed:**
- `mockModels`, `mockTryOnPoses`, `poseCategoryLabels` from `@/data/mockData`
- `ShimmerImage` from `@/components/ui/shimmer-image`

**New state:**
- `workflowPoseSelections: Record<string, string[]>` -- pose IDs for Virtual Try-On

**Files modified:**
- `src/components/app/CreativeDropWizard.tsx` -- all changes above
- `src/pages/CreativeDrops.tsx` -- update `extractPerWorkflowData` to handle `pose_ids`

**Aspect ratio handling per workflow:**
- Flat Lay: hide selector, show fixed "1:1" badge (lock_aspect_ratio is true)
- All others: show selector as-is

**Model picker UI:** Grid of 40+ model avatars with name labels below each. Uses the same compact circle layout but with names visible (per user feedback about identification).
