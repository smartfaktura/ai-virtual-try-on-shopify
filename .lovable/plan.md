

# Add Loading State After Product Selection in Start Workflow Modal

## Problem
When clicking a product or sample in the modal, navigation to the generate page takes a moment, but there's no visual feedback — it feels laggy.

## Changes

### `src/components/app/StartWorkflowModal.tsx`

1. **Add `isNavigating` state** (`useState(false)`)

2. **In `handleConfirmProduct` and `handleUseSample`**: Set `isNavigating(true)` before navigating. Use a short `setTimeout` (50ms) to let the loading state render before the navigation kicks in.

3. **On the "Continue" button** (product step with existing products): Show `<Loader2 className="animate-spin" />` + "Loading..." when `isNavigating` is true, disable the button.

4. **On the sample product button**: Show a small spinner overlay or disable with loading state when `isNavigating` is true.

5. **Reset `isNavigating` in the `reset()` function**.

### File
- `src/components/app/StartWorkflowModal.tsx` — add `isNavigating` state, show spinner on buttons after click

