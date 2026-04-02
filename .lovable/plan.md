

# Make Catalog Shot Set Active with BETA Label

## Changes

### 1. `src/pages/Workflows.tsx` — Remove `comingSoon` for Catalog Shot Set
Replace `comingSoon={workflow.slug === 'catalog-shot-set' || workflow.name === 'Catalog Shot Set'}` with a new `beta` prop on both `WorkflowCard` and `WorkflowCardCompact` (lines 564, 578).

### 2. `src/components/app/WorkflowCard.tsx` — Add `beta` prop
- Add `beta?: boolean` to the props interface
- Instead of rendering the disabled "Coming Soon" card, render the normal active card but with a "BETA" badge overlay (top-right corner, primary color)
- The card remains fully clickable

### 3. `src/components/app/WorkflowCardCompact.tsx` — Add `beta` prop
- Same approach: add `beta?: boolean` prop
- Render the normal active card with a "BETA" badge in the top-right corner

The BETA badge will use: `<Badge className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground text-[10px]">BETA</Badge>`

