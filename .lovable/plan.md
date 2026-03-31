

# Phase 5: Workflow Card + Animation + Discoverability

## What gets built
Make the Catalog Shot Set workflow discoverable from the Workflows page with a card, animation data, and routing from the StartWorkflowModal.

## Files to modify

### 1. `src/components/app/workflowAnimationData.tsx`
Add a `'Catalog Shot Set'` entry with carousel mode. Reuse existing try-on showcase images as placeholder carousel backgrounds (since catalog reuses the same generation pipeline). Add elements with Package + Users + Grid icons to represent the matrix concept.

### 2. `src/pages/Workflows.tsx`
Update `handleCreateVisualSet` to route `'Catalog Shot Set'` (or slug `'catalog-shot-set'`) to `/app/catalog` instead of the generic generate page.

### 3. `src/components/app/StartWorkflowModal.tsx`
Add a 4th entry to `WORKFLOW_OPTIONS` for Catalog Shot Set with slug `'catalog-shot-set'` and subtitle like "Bulk catalog photography at scale". Route it to `/app/catalog` in the modal's navigation logic.

## Technical details
- The workflow card will appear automatically since the `catalog-shot-set` row is already in the `workflows` DB table and the Workflows page queries all system workflows
- Animation data keys match by `workflow.name`, so the key must be `'Catalog Shot Set'`
- The StartWorkflowModal navigate logic needs a special case for catalog (like Perspectives gets `/app/perspectives`)

