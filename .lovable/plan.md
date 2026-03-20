

# Multi-Select Aspect Ratios, Multi-Select Framings, Fix Image Count

## Problems
1. **Image Size (Aspect Ratio)** is pre-selected to Square (1:1). User wants no pre-selection, and ability to select multiple ratios — each additional ratio = another generation per scene.
2. **Framing** is single-select. User wants Auto pre-selected but ability to select multiple framings — each additional framing = another generation per scene.
3. **Loading state image count is wrong.** The `MultiProductProgressBanner` receives `totalExpectedImages = productQueue.length * tryOnSceneCount` but doesn't account for model count. Should be `productQueue.length * tryOnSceneCount * tryOnModelCount`.

## Changes

### 1. Multi-select Aspect Ratios (`AspectRatioPreview.tsx`)
- Change `AspectRatioSelector` from single-select (`value: AspectRatio`) to multi-select (`value: Set<AspectRatio>`, `onChange: (ratios: Set<AspectRatio>) => void`)
- No pre-selected default — user must pick at least one
- Visual: selected items get primary border + ring, unselected get default border

### 2. Multi-select Aspect Ratio state (`Generate.tsx`)
- Change `aspectRatio` state from `AspectRatio` to `selectedAspectRatios: Set<AspectRatio>` (initially empty)
- Derive `aspectRatioCount = Math.max(1, selectedAspectRatios.size)` for credit calculation
- Update `workflowImageCount` to include `* aspectRatioCount`
- Update `singleProductCreditCost` for try-on: multiply by `aspectRatioCount`
- In generation loops (workflow + try-on), iterate over each selected aspect ratio, sending one job per ratio
- Pass first selected ratio as backward-compat `aspectRatio` to payload

### 3. Multi-select Framing (`FramingSelector.tsx`)
- Change from single-select to multi-select: `selectedFramings: Set<FramingOption | null>`, with `null` = Auto
- Auto is pre-selected by default
- When Auto is selected alongside others, Auto is deselected (specific framings override)
- When Auto is re-selected, all specific framings are cleared
- Visual: multiple items can have primary border

### 4. Multi-select Framing state (`Generate.tsx`)
- Change `framing` state from `FramingOption | null` to `selectedFramings: Set<FramingOption | 'auto'>` (initially `new Set(['auto'])`)
- Derive `framingCount` for credit calculation (auto = 1, otherwise = set size)
- Update credit calc: multiply by `framingCount`
- In generation loops, iterate over framings

### 5. Update WorkflowSettingsPanel (`WorkflowSettingsPanel.tsx`)
- Accept new multi-select props: `selectedAspectRatios`, `setSelectedAspectRatios`, `selectedFramings`, `setSelectedFramings`
- Update cost summary to show `× N ratios` and `× N framings` when > 1
- Update generate button text to reflect total image count

### 6. Fix loading state image count (`Generate.tsx`)
- Line 3683: Change `totalExpectedImages={productQueue.length * tryOnSceneCount}` to `productQueue.length * tryOnSceneCount * tryOnModelCount`
- Also multiply by `aspectRatioCount` and `framingCount` for workflows

### 7. Update generation loops
- **Workflow** (`handleWorkflowGenerate`): outer loop over variations, inner loop over aspect ratios × framings
- **Try-On** (`handleTryOnConfirmGenerate`): add aspect ratio and framing iteration
- Each combination = one enqueue call with specific `aspectRatio` and `framing` in payload

## Files to edit
- `src/components/app/AspectRatioPreview.tsx` — multi-select UI
- `src/components/app/FramingSelector.tsx` — multi-select UI
- `src/pages/Generate.tsx` — state, credit calc, generation loops, loading state fix
- `src/components/app/generate/WorkflowSettingsPanel.tsx` — accept new props, update cost display
- `src/components/app/generate/TryOnSettingsPanel.tsx` — accept new props if framing/ratio shown there

