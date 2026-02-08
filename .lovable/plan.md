

## Update Virtual Try-On Set Workflow Card

### What Changes

**1. Add uploaded images to the project**
- Copy `freestyle-1_4.png` (flatlay product) to `src/assets/workflows/workflow-tryon-product-flatlay.png`
- Copy `freestyle-1_3.png` (end result) to `src/assets/workflows/workflow-tryon-result.png`

**2. Update Virtual Try-On animation data (`workflowAnimationData.tsx`)**
- Replace the background image (`tryonResult`) with the new end-result image (the model wearing the white crop top)
- Replace the product thumbnail (`tryonProduct` / tank-white-1.jpg) with the new flatlay image
- Replace the model thumbnail with Charlotte's portrait (`model-female-average-european.jpg`) and update the label to "Charlotte"
- Replace the scene thumbnail with the editorial minimal scene (`pose-editorial-minimal.jpg`) and update the label to "Editorial Minimal"

| Element | Current | New |
|---|---|---|
| Background (result) | `drop-model-cream-bodysuit.jpg` | Uploaded end result (model in white crop top) |
| Product chip | `tank-white-1.jpg` ("Tank Top") | Uploaded flatlay ("Crop Top") |
| Model chip | `model-female-slim-american-blonde.jpg` ("Slim Blonde") | `model-female-average-european.jpg` ("Charlotte") |
| Scene chip | `pose-lifestyle-coffee.jpg` ("Coffee Shop") | `pose-editorial-minimal.jpg` ("Editorial Minimal") |

**3. Auto-play Virtual Try-On Set + pause-on-other-hover behavior**

Currently, workflow cards only animate on hover (`isActive={isHovered}`). The changes needed:

- **`Workflows.tsx`**: Add state to track which workflow card is currently hovered (`activeWorkflowName`). Pass this down to each `WorkflowCard`.
- **`WorkflowCard.tsx`**: Accept a new `autoPlay` prop and a callback for hover state changes. The Virtual Try-On Set card will:
  - Auto-play its animation by default (no hover needed)
  - Pause when the user hovers over a **different** workflow card
  - Resume when no other card is hovered
- **Logic**: `isActive` for Virtual Try-On = `true` when no other card is hovered, or when Virtual Try-On itself is hovered. For all other cards, behavior stays the same (play on hover only).

### Files Modified

| File | Change |
|---|---|
| `src/assets/workflows/` | 2 new image files added |
| `src/components/app/workflowAnimationData.tsx` | Update imports and Virtual Try-On scene definition |
| `src/components/app/WorkflowCard.tsx` | Add `autoPlay` prop + hover callback |
| `src/pages/Workflows.tsx` | Track active hover state, pass `autoPlay` to Virtual Try-On card |
