

# Fix "Workflows" → "Templates" in Back Buttons

Two remaining places where the old "Workflows" label appears in back-navigation buttons:

## Changes

### 1. `src/pages/Generate.tsx` (line 2128)
- `'Workflows'` → `'Templates'` in the `backAction.content` prop

### 2. `src/pages/Perspectives.tsx` (line 670)
- `'Workflows'` → `'Templates'` in the back button text

Both navigation paths (`/app/workflows`) stay the same — only the visible label changes.

