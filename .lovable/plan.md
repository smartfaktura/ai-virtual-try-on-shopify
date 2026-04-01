

# Add Coming Soon state to Dashboard Workflow Card

## Problem
`DashboardWorkflowCard` in `src/pages/Dashboard.tsx` has no `comingSoon` logic, so "Catalog Shot Set" renders as a fully interactive card instead of a placeholder.

## Fix — `src/pages/Dashboard.tsx`

### 1. Add `comingSoon` prop to `DashboardWorkflowCard`
Accept a `comingSoon?: boolean` prop. When true:
- Apply `opacity-75 border-dashed border-border/60 cursor-default` to the card container (remove hover effects)
- Add a `<Badge variant="outline">Coming Soon</Badge>` in the top-right of the thumbnail area
- Replace the "Create Set" button with a disabled/muted version (or hide it)

### 2. Pass `comingSoon` when rendering
At the usage site (~line 474), add the same condition used in `Workflows.tsx`:
```tsx
<DashboardWorkflowCard
  key={workflow.id}
  workflow={workflow}
  onNavigate={handleNavigate}
  comingSoon={workflow.slug === 'catalog-shot-set' || workflow.name === 'Catalog Shot Set'}
/>
```

Single file change: `src/pages/Dashboard.tsx`

