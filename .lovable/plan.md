

# Add Catalog Studio (BETA) to Sidebar Navigation

## Changes — Single file: `src/components/app/AppShell.tsx`

### 1. Add nav item after Library
Insert `{ label: 'Catalog Studio', icon: LayoutTemplate, path: '/app/catalog' }` at line 60 (after Library, before Brand Models). The `LayoutTemplate` icon is already imported.

### 2. Add BETA badge to NavItemButton
Add a `beta` check: if `item.label === 'Catalog Studio'`, render a small "BETA" badge next to the label text (only when sidebar is not collapsed). Style: `text-[9px] font-semibold uppercase bg-primary/20 text-primary px-1.5 py-0.5 rounded`.

### 3. Add prefetch entry
Add `'/app/catalog': () => { import('@/pages/CatalogHub'); }` to the `prefetchMap`.

