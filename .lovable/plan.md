

## Fix: Selfie / UGC Set Shows Regular Scene Library Instead of Workflow Scenes

### Problem
The Selfie / UGC Set workflow currently shows the generic scene library (Studio Shots, Lifestyle, etc.) as a separate "Scene" step. This happens because the workflow has `uses_tryon: true`, which routes it through the standard Virtual Try-On path that includes the regular scene/pose picker. The workflow's 16 UGC-specific scene variations (Golden Hour, Car Selfie, Gym, etc.) are already shown in the Settings step -- so the regular Scene step is redundant and confusing.

### Root Cause
Three places in `Generate.tsx` treat the UGC workflow like a regular try-on flow:

1. **Step indicator** (line ~768): The `virtual-try-on` branch runs first, adding a "Scene" step (step 4) to the wizard progress bar
2. **Step list** (line ~803): Same issue -- shows `['Product', 'Brand', 'Model', 'Scene', 'Settings', 'Results']` instead of skipping Scene
3. **Model step "Continue" button** (line ~1272): The condition `uiConfig?.show_model_picker && !activeWorkflow?.uses_tryon` is `false` for UGC (because `uses_tryon` is true), so it falls through to "Continue to Scene" instead of "Continue to Settings"

### Solution
Add `isSelfieUgc` checks before the `virtual-try-on` branches in all three locations so the UGC workflow skips the regular scene step entirely and goes Product -> Brand -> Model -> Settings -> Results.

### Changes (single file)

**File: `src/pages/Generate.tsx`**

1. **`getStepNumber()`**: Add an `isSelfieUgc` check before the `virtual-try-on` check, using the same step mapping as `show_model_picker` workflows (no pose step):
   - Product=1, Brand=2, Model=3, Settings=4, Results=5

2. **`getSteps()`**: Add an `isSelfieUgc` check returning:
   - `['Product', 'Brand', 'Model', 'Settings', 'Results']`

3. **Model step continue button** (line ~1270-1276): Add `isSelfieUgc` to route directly to settings:
   - `isSelfieUgc ? go to settings : (existing logic)`

This means the 16 UGC scene variations will only appear in the Settings step's variation grid (where the user picks which scenes to generate), and the generic scene library step is completely skipped.
