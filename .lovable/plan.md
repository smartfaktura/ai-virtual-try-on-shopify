

# Fix Library Page Layout to Match Other Pages

## Problem
The Library page (`/app/library` — `src/pages/Jobs.tsx`) uses a custom layout wrapper with its own padding (`min-h-screen`, `px-4 sm:px-6 py-8`), while the AppShell already provides `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-8 pb-8`. This causes double padding and misaligned content compared to `/app/products`, `/app/video`, `/app/workflows` which all use the shared `<PageHeader>` component.

## Fix

### `src/pages/Jobs.tsx`

1. Import `PageHeader` from `@/components/app/PageHeader`
2. Replace the outer wrapper (lines 363-372):

**Before:**
```tsx
<div className="min-h-screen">
  <div className="px-4 sm:px-6 py-8 space-y-6">
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Library</h1>
      <p className="text-muted-foreground mt-1 text-sm">...</p>
    </div>
    ...content...
  </div>
</div>
```

**After:**
```tsx
<PageHeader
  title="Library"
  subtitle="All your visuals, organized for review, selection, and publishing"
>
  ...content (smart views, toolbar, grid, modals)...
</PageHeader>
```

3. Remove the closing `</div></div>` at the bottom that corresponded to the old wrapper.

| File | Change |
|------|--------|
| `src/pages/Jobs.tsx` | Replace custom wrapper with `<PageHeader>` component to match other pages |

