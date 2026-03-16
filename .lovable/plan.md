

## Plan: Replace static icons with animated thumbnails on /features/workflows

### Problem
The `/features/workflows` landing page shows plain gradient backgrounds with centered icons for each workflow card, while the `/app/workflows` page already has rich animated thumbnails (try-on recipe animations, carousel slideshows, staging before/after wipes, upscale blur-to-sharp reveals). The feature page should reuse these.

### Approach
Import `WorkflowAnimatedThumbnail` and `workflowScenes` into `WorkflowsFeature.tsx` and replace the icon+gradient visual side with the animated thumbnail component, using an IntersectionObserver to trigger animations on scroll (same pattern as `WorkflowCard`).

### Changes

**`src/pages/features/WorkflowsFeature.tsx`**

1. Import `WorkflowAnimatedThumbnail` and `workflowScenes` from the app components
2. For each workflow card, replace the gradient+icon div (lines 170-174) with:
   - An `aspect-square lg:aspect-[3/4]` container holding `<WorkflowAnimatedThumbnail>`
   - An IntersectionObserver per card to set `isActive` when visible (threshold 0.3)
3. Fallback: if no matching scene exists in `workflowScenes` for a workflow name, keep the current icon display
4. Remove unused gradient/iconBg properties from the workflow data (or just ignore them)

This reuses 100% of the existing animation code — no duplication.

