

## Fix Selfie / UGC Set Workflow + Content Updates

### Problem 1: "Please select a model and scene first" Error

The Selfie / UGC workflow has `uses_tryon: true`, which sets `generationMode` to `'virtual-try-on'`. When the user clicks "Generate", line 458 checks `generationMode === 'virtual-try-on'` and requires both `selectedModel` AND `selectedPose`. But UGC uses workflow variations (scenes grid), not poses from the pose picker -- so `selectedPose` is always null, blocking generation.

**Fix in `src/pages/Generate.tsx` (line 458):** Add `isSelfieUgc` check to skip the try-on validation and fall through to the `hasWorkflowConfig` path instead:

```tsx
if (generationMode === 'virtual-try-on' && !isSelfieUgc) {
  if (!selectedModel || !selectedPose) { toast.error('Please select a model and scene first'); return; }
  handleTryOnConfirmGenerate(); return;
}
```

### Problem 2: Update Workflow Variations in Database

Three variation changes via SQL migration:

1. **"Before / After Moment"** (index 11, Content Creator) -- Change label to "Product Holding in Hand" and update instruction to describe a natural hand-held product shot
2. **"Testimonial / Review"** (index 13, Content Creator) -- Remove entirely
3. **"In-Use Close-up"** (index 14, Close-up) -- Update instruction for better product-in-use close-up framing

This requires a SQL migration to update the `generation_config` JSONB in the `workflows` table.

### Problem 3: Add Framing Section for Selfie Workflow

Add the existing `FramingSelector` component to the Selfie / UGC settings step (alongside the mood selector and generation settings). This lets users choose selfie framing like close-up, upper body, full body etc.

**Fix in `src/pages/Generate.tsx`:** Add `<FramingSelector>` in the selfie settings section (after the UGC Mood card, before Generation Settings). The `framing` state already exists and is already passed to the workflow payload.

---

### Technical Summary

- **1 file modified:** `src/pages/Generate.tsx` (2 small changes: fix validation gate + add FramingSelector)
- **1 SQL migration:** Update `generation_config` variations in the `workflows` table for Selfie / UGC Set
- No new dependencies
- No new components needed (reuses existing `FramingSelector`)

