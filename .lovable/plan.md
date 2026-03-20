

# Fix: Workflow Title Shows "Creating Virtual Try-On..." Instead of Workflow Name

## Problem
The heading priority is wrong. When a workflow like "Selfie / UGC Set" uses try-on mode, the condition `generationMode === 'virtual-try-on'` matches first, showing "Creating Virtual Try-On..." instead of "Creating Selfie / UGC Set...". Same issue affects the subtitle.

## Fix — `src/pages/Generate.tsx`

### Reorder the title conditions (line ~3828-3832)
Move `hasWorkflowConfig` check **before** the `virtual-try-on` check so workflows always show their own name:

```
{isUpscale ? `Enhancing to ...` :
 hasWorkflowConfig ? `Creating ${activeWorkflow?.name}...` :
 generationMode === 'virtual-try-on' ? 'Creating Virtual Try-On...' :
 'Creating Your Images...'}
```

### Reorder the subtitle conditions (line ~3834-3839)
Same reorder — workflow subtitle before try-on subtitle:

```
{isUpscale ? ... :
 hasWorkflowConfig ? `Generating ${selectedVariationIndices.size} variation${...} of "${selectedProduct?.title || ...}"${hasMultipleJobs ? ` · ${multiProductJobIds.size} images` : ''}` :
 generationMode === 'virtual-try-on' ? `Dressing ${selectedModel?.name} in "${selectedProduct?.title}"${hasMultipleJobs ? ...}` :
 ...rest}
```

This ensures workflow runs show "Creating Selfie / UGC Set..." with proper subtitle, while plain try-on (no workflow) still shows "Creating Virtual Try-On...".

