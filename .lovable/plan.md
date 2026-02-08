

## Remove "Generate Previews" Button from Workflows Page

### What Changes

Remove the admin "Generate X Previews" button and all its associated logic from `src/pages/Workflows.tsx`.

### Technical Details

**File: `src/pages/Workflows.tsx`**

Remove the following:
- The `generatingIds` state and `setGeneratingIds`
- The `workflowsMissingPreviews` computed variable
- The `handleGeneratePreviews` async function
- The `isAnyGenerating` computed variable
- The entire conditional block that renders the "Generate X Previews" button (the `<div className="flex justify-end">` section)
- The `Sparkles` and `Loader2` icon imports (no longer needed)
- The `useQueryClient` import and `queryClient` variable (only used by the preview generation)
- The `toast` import (only used by the preview generation)
- The `supabase` import (only used by the preview generation)

The `hoveredWorkflow` state, workflow query, navigation, and card rendering all stay intact since they power the workflow grid and auto-play behavior.

