

# Hide Catalog from Non-Admin Users

## Changes

### 1. `src/components/app/AppShell.tsx`
- Import `useIsAdmin` hook
- Filter the `navItems` array: hide the "Catalog" entry when `isRealAdmin` is false

### 2. `src/pages/Workflows.tsx`
- Import `useIsAdmin` hook
- Filter `workflows` list before rendering: exclude any workflow with `slug === 'catalog-shot-set'` when `isRealAdmin` is false
- This hides the card from both `rows` and grid layouts automatically

### 3. `src/components/app/StartWorkflowModal.tsx`
- Import `useIsAdmin` hook
- Filter out the "Catalog Shot Set" entry from the quick-start modal when not admin

All three spots use `isRealAdmin` (not `isAdmin`) so that even in "visitor view" mode the catalog route remains accessible to the admin account — it's just hidden from regular users entirely.

