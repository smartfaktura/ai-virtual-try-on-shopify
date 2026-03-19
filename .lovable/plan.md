

# Move Image Count & Product Assignment Into Per-Workflow Config Steps

## Problem

Currently, "Images Per Workflow" is a global setting buried in the Delivery step (step 5+), applied uniformly to all workflows. Users configure scenes, models, and formats per workflow in earlier steps without knowing how many images they're targeting. Worse, they can't:
- Set different image counts per workflow (e.g., 50 for Flat Lay, 10 for Try-On)
- Assign specific products to specific workflows (e.g., only dresses to Try-On, all products to Flat Lay)

## Design

### New Flow
```text
Step 0: Details
Step 1: Products (select ALL products you want to use)
Step 2: Select Workflows
Steps 3+: Config per workflow — now includes:
  ├─ Product filter (default: all selected, can narrow down)
  ├─ Images per workflow (moved here from Delivery)
  ├─ Scenes / Models / Formats (existing)
  └─ Credit estimate (updated per-workflow)
Delivery step: Only delivery mode + schedule (no more image count)
Review step: Shows per-workflow image counts + product assignments
```

### State Changes
- Replace single `imagesPerDrop: number` with `imagesPerWorkflow: Record<string, number>` (keyed by workflow ID, default 25)
- Add `workflowProductIds: Record<string, Set<string>>` (defaults to all selected products)
- Keep `imagesPerDrop` as a fallback for backward compatibility in save payload (use max or first value)

## Changes

### File: `src/components/app/CreativeDropWizard.tsx`

**1. State — replace global with per-workflow (lines ~194)**
```tsx
// Replace:
const [imagesPerDrop, setImagesPerDrop] = useState(initialData?.imagesPerDrop || 25);
// With:
const [imagesPerWorkflow, setImagesPerWorkflow] = useState<Record<string, number>>(() => {
  if (initialData?.imagesPerWorkflow) return initialData.imagesPerWorkflow;
  return {};
});
const [workflowProductIds, setWorkflowProductIds] = useState<Record<string, Set<string>>>({});
// Helper:
const getWorkflowImageCount = (wfId: string) => imagesPerWorkflow[wfId] ?? 25;
const getWorkflowProducts = (wfId: string) => workflowProductIds[wfId] ?? selectedProductIds;
```

**2. Config step UI — add product filter + image count (line ~889)**

After the guidance text, before scenes section, add two new sections:

**Product Assignment**: Collapsible section defaulting to "All X products". Expandable to show thumbnails with toggles. Chip summary: "All 5 products" or "3 of 5 products".

**Images for This Workflow**: Same preset buttons (10/25/50/100 + custom) but scoped to this workflow. Shows current value prominently.

**3. Remove global "Images Per Workflow" from Delivery step (lines ~1441-1462)**
Delete the entire `IMAGES PER WORKFLOW` section from the Delivery step. Keep only Delivery mode, schedule, and credit estimate.

**4. Update credit calculator call (line ~302)**
Change from single `imagesPerDrop` to per-workflow calculation:
```tsx
const costEstimate = calculateDropCredits(
  workflowConfigs, // add imageCount per config
  effectiveFrequency,
  // product counts are now per-workflow
);
```

### File: `src/lib/dropCreditCalculator.ts`

**5. Support per-workflow image counts**
Add `imageCountOverride` and `productCount` to `WorkflowCostConfig`. Update `calculateDropCredits` to use per-workflow values instead of a single `imagesPerDrop`.

**6. Save payload (line ~451)**
- Store `images_per_drop` as the max value for backward compat
- Store per-workflow counts in `scene_config[wfId].image_count`
- Store per-workflow product IDs in `scene_config[wfId].product_ids`

**7. Review step (lines ~1566-1568)**
Update to show per-workflow image counts instead of global "25 × 3 workflows". Each workflow summary card shows its own image count and product count.

### File: `supabase/functions/trigger-creative-drop/index.ts`

**8. Read per-workflow image count from scene_config**
In the orchestrator loop, check for `wfSceneConfig.image_count` to override the global `images_per_drop`. Check for `wfSceneConfig.product_ids` to filter products per workflow.

### Backward Compatibility
- If `imagesPerWorkflow` is empty (old data), fall back to `imagesPerDrop` or 25
- If `workflowProductIds` is empty, use all selected products (current behavior)
- Existing schedules continue to work unchanged

