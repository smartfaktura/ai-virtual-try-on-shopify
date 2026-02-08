

## Fix Virtual Try-On Generate Button

### Root Cause

The "Generate" button on the try-on Settings step doesn't directly start generation. Instead, it opens a second confirmation modal (TryOnConfirmModal). This creates a confusing double-confirmation UX since the Settings page already shows a full preview, model/pose summary, credit cost, and the generate button -- essentially doing the job of a confirmation step.

Additionally, there's a hardcoded cost label bug: the settings page says "1 images x 3 credits each" when the actual cost per try-on image is 8 credits.

### What Will Change

1. **Remove the redundant confirmation step for try-on** -- clicking "Generate" on the Settings page will directly start the generation instead of opening another modal
2. **Fix the silent failure** when product is missing -- show a proper error message instead of doing nothing
3. **Fix the hardcoded credit label** -- change "3 credits each" to correctly show 8 credits per try-on image

### Technical Details

**File: `src/pages/Generate.tsx`**

Three changes:

**Change 1 -- Direct generation on try-on (line 331-334)**

In `handleGenerateClick`, instead of opening the TryOnConfirmModal, call `handleTryOnConfirmGenerate()` directly:

Before:
```typescript
if (generationMode === 'virtual-try-on') {
  if (!selectedModel || !selectedPose) { toast.error('...'); return; }
  setTryOnConfirmModalOpen(true); return;
}
```

After:
```typescript
if (generationMode === 'virtual-try-on') {
  if (!selectedModel || !selectedPose) { toast.error('...'); return; }
  handleTryOnConfirmGenerate(); return;
}
```

**Change 2 -- Fix silent return (line 328)**

Before:
```typescript
if (!selectedProduct) return;
```

After:
```typescript
if (!selectedProduct && !(sourceType === 'scratch' && scratchUpload)) {
  toast.error('Please select a product first');
  return;
}
```

**Change 3 -- Fix credit cost label (line 1201)**

Before:
```typescript
<p className="text-xs text-muted-foreground">
  {parseInt(imageCount)} images x 3 credits each
</p>
```

After:
```typescript
<p className="text-xs text-muted-foreground">
  {parseInt(imageCount)} images x 8 credits each
</p>
```

### Files Changed

| File | Action | Description |
|---|---|---|
| `src/pages/Generate.tsx` | Edit | Skip confirm modal for try-on, fix silent failure, fix credit label |

