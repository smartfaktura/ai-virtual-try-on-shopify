
## Goal

Promote the **Product Visuals** workflow to a full-width hero card at the top of the Visual Studio page (both mobile and desktop), rename it to **"Create Product Visuals"**, and keep the remaining workflows in the existing grid below.

## Changes

### 1. Separate Product Visuals from the grid (`src/pages/Workflows.tsx`)

- Split `workflows` into two: `featuredWorkflow` (slug `product-images`) and `otherWorkflows` (everything else).
- Render `featuredWorkflow` above the grid as a dedicated full-width hero card using a new `WorkflowHeroCard` component.
- Pass `displayName="Create Product Visuals"` to the hero card.
- Remove the `featured` prop from the grid cards (no longer needed).

### 2. Create `WorkflowHeroCard` component (`src/components/app/WorkflowHeroCard.tsx`)

A full-row card with:
- **Desktop**: horizontal layout -- animated thumbnail on the left (~45%), text + CTA on the right. Prominent primary CTA button "Start Creating".
- **Mobile**: stacked layout -- thumbnail on top (aspect 16:9), title + short description + CTA below.
- Subtle `ring-1 ring-primary/20` border with `bg-gradient-to-r from-primary/5 to-transparent` background.
- "RECOMMENDED" badge in the top-right corner.
- Reuses `WorkflowAnimatedThumbnail` for the animated preview.
- Accepts `workflow`, `onSelect`, `displayName` props.

### 3. Minor cleanup

- Remove `featured` prop usage from `WorkflowCard` and `WorkflowCardCompact` render calls in `Workflows.tsx` (the hero card replaces this visual treatment). The prop itself stays in the components for potential reuse.

### Files changed
- `src/components/app/WorkflowHeroCard.tsx` (new)
- `src/pages/Workflows.tsx` (split workflows, render hero card first)
