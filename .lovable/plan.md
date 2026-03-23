

# Combine Workflows Header + Grid Toggle on One Line

## Problem
The title "Workflows", subtitle, and grid view toggle are on separate lines with too much whitespace between them. The layout toggle floats disconnected below the subtitle.

## Solution
Add an optional `actions` prop to `PageHeader` so the toggle group can sit inline with the title on the right side. This keeps title + actions on one row and subtitle below — clean and compact.

```text
┌─────────────────────────────────────────┐
│ Workflows                    [≡] [⊞]   │
│ Choose a workflow and generate...       │
└─────────────────────────────────────────┘
```

## Changes

### 1. `src/components/app/PageHeader.tsx`
Add optional `actions` prop (ReactNode) rendered to the right of the title:

```tsx
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backAction?: ...;
  actions?: React.ReactNode;  // NEW
  children: React.ReactNode;
}
```

In the title row, add `justify-between` and render `actions` on the right:
```tsx
<div className="flex items-center justify-between gap-3">
  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
    {backAction && ...}
    <h1 ...>{title}</h1>
  </div>
  {actions && <div className="shrink-0">{actions}</div>}
</div>
```

### 2. `src/pages/Workflows.tsx`
- Pass the `ToggleGroup` layout switcher as `actions` prop to `PageHeader` instead of rendering it separately
- Remove the standalone layout switcher blocks (lines 404-420 inside activity section, lines 425-443 for no-activity case)
- Pass a single `actions` JSX with the toggle group to `PageHeader`

### Files
- `src/components/app/PageHeader.tsx` — add `actions` prop
- `src/pages/Workflows.tsx` — move toggle group into PageHeader actions, remove duplicate blocks

