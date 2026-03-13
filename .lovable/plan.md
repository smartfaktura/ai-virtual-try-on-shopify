

## Creative Drops Wizard — Frontend Improvements & Feature Additions

### Problems Identified

1. **Products step is grid-only** — no list view option for users with many products
2. **Workflow step shows irrelevant workflows** — "Interior / Exterior Staging" and "Image Upscaling" should be hidden (not content-generation workflows)
3. **Per-workflow configuration is buried** — collapsible sections are hard to discover and configure
4. **No seasonal campaign presets** — users must manually write seasonal directions
5. **No "random model" option** — users who want variety must manually select many models
6. **No "random scenes" option** — same issue for scenes
7. **Only single aspect ratio per workflow** — no way to select multiple formats (e.g. 1:1 AND 9:16) for multi-platform output
8. **Estimated Cost section shown in workflow step** is redundant (also in Schedule step) and clutters the UI

---

### Plan

#### 1. Filter Out Non-Content Workflows
In the wizard's workflow query (step 3), filter out "Interior / Exterior Staging" and "Image Upscaling" by name. These are utility workflows, not content generation workflows suited for recurring drops.

**File:** `CreativeDropWizard.tsx` — filter `workflows` before rendering in step 2.

#### 2. Add List View Toggle for Products (Step 2)
Add a Grid/List toggle button pair above the product grid. List view shows product image (small thumbnail), title, product type, and a checkbox — similar to the existing `ProductMultiSelect` but with a compact row layout.

**File:** `CreativeDropWizard.tsx` — add `productViewMode` state (`'grid' | 'list'`), render conditionally.

#### 3. Add Seasonal Campaign Presets (Step 1)
Add a "Campaign Theme" chip selector below the Schedule Name field with options: None, Spring, Summer, Autumn, Winter, Holiday/Christmas, Valentine's, Back to School, Black Friday. Selecting a preset auto-fills the "Special Instructions" textarea with seasonal direction text (e.g. "Warm autumn tones, cozy layering, golden-hour lighting, fallen leaves and earth-toned props"). Users can still edit freely.

**File:** `CreativeDropWizard.tsx` — new `SEASONAL_PRESETS` constant array, chip selector UI, auto-fill logic.

#### 4. Add "Random" Option for Models and Scenes
For model selection: add a "Random / Diverse" toggle that, when enabled, tells the system to randomly pick from the full model pool at generation time. Stores `"__random__"` as a special marker in model selections.

For scene selection: add a "Random Scenes" chip alongside the scene grid. When toggled, all scenes are included and the system will randomly distribute across them.

**File:** `CreativeDropWizard.tsx` — add random toggle UI in the Models and Scenes collapsible sections.

#### 5. Multi-Format Selection Per Workflow
Change the aspect ratio selector from single-select to multi-select chips. Users can pick e.g. both `1:1` and `9:16`. The generation engine will produce images in each selected format. Store as `string[]` instead of `string` in `workflowFormats`.

**File:** `CreativeDropWizard.tsx` — change `workflowFormats` type from `Record<string, string>` to `Record<string, string[]>`, update UI to toggle chips, update save payload, update credit calculator to multiply by format count.

**File:** `dropCreditCalculator.ts` — add `formatCount` parameter to cost calculation.

#### 6. Remove Redundant "Estimated Cost" from Workflow Step
The sticky cost calculator in step 3 is useful as a quick glance — keep it but make it more compact (single line). The full breakdown only appears in step 4 (Schedule).

**File:** `CreativeDropWizard.tsx` — simplify the sticky cost bar in step 2.

#### 7. Review Step Updates
Update the review step to reflect multi-format badges and seasonal theme display.

---

### Files Changed

| File | Change |
|------|--------|
| `src/components/app/CreativeDropWizard.tsx` | Filter workflows, add list view, seasonal presets, random options, multi-format selection |
| `src/lib/dropCreditCalculator.ts` | Accept `formatCount` in cost calculation |

### No Database Changes Required
All new fields (seasonal preset, random markers, multi-format arrays) fit within existing `scene_config` JSONB and `theme_notes` text columns.

