

## Add Column Count Selector to Library

Add a grid density control to the Library toolbar that lets users choose how many columns to display, with device-appropriate options.

### Column Options by Device
- **Desktop (≥1280px)**: 3, 4, 5 columns
- **Tablet (768–1279px)**: 2, 3, 4 columns  
- **Mobile (<768px)**: 1, 2 columns

### Changes

**`src/pages/Jobs.tsx`**

1. **Replace `useColumnCount` hook** with a stateful approach:
   - Store user's column preference in `localStorage` (key: `library-columns`)
   - Compute available column options based on viewport width (using resize listener)
   - Default to current auto-detected value; clamp stored preference to valid range on resize

2. **Add column selector buttons** in the toolbar row (next to Sort/Select controls):
   - Small `LayoutGrid` icon + pill buttons showing available column counts (e.g. `3 4 5`)
   - Same pill styling as the existing Sort buttons (`bg-foreground text-background` for active, `bg-muted/40` for inactive)
   - Place between Sort and Select controls with a subtle separator

3. **Update masonry layout** — the `columns` array and grid rendering already use `columnCount`, so it just works once the value changes.

### UI Mockup
```text
[Search...                    ] [Newest] [Oldest]  ⊞ [3] [4] [5]  [☐ Select]
```

One file to modify: `src/pages/Jobs.tsx`.

