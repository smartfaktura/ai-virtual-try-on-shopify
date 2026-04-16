

# Rename "Templates" Back Button to "Visual Studio"

## Problem
Workflow pages show a back button labeled "Templates" but the destination page (`/app/workflows`) is now called "Visual Studio". The label is outdated.

## Changes

### 1. `src/pages/Generate.tsx` (line 2151)
Change `'Templates'` to `'Visual Studio'` in the backAction content:
```tsx
backAction={{ content: activeWorkflow ? 'Visual Studio' : 'Dashboard', ... }}
```

### 2. `src/pages/Perspectives.tsx` (line 680)
Change the button text from `Templates` to `Visual Studio`:
```tsx
<ArrowLeft className="w-4 h-4" />
Visual Studio
```

### Files
- `src/pages/Generate.tsx` — 1 string change
- `src/pages/Perspectives.tsx` — 1 string change

