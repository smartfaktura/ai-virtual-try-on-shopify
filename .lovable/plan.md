

# Reorder Nav + Hide Content Calendar

## Changes

### 1. `src/components/app/AppShell.tsx` (line 51–63)
Reorder so "Create Visuals" comes right after "Dashboard", then "Products" after that. Remove "Content Calendar" line entirely.

```
Dashboard → Create Visuals → Products → Explore → Video → Freestyle → Library → Catalog Studio → Brand Models → Earn Credits
```

### 2. `src/components/landing/LandingFooter.tsx` (line 9)
Remove the `{ label: 'Content Calendar', to: '/features/creative-drops' }` entry from the Product footer links.

Two files, two small edits.

