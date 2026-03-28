

# Add Source Filter to Library (Freestyle / Workflow)

## What
Add filter chips next to the existing Sort buttons that let users filter library items by source: **All**, **Freestyle**, **Workflow**.

## How

### 1. `src/hooks/useLibraryItems.ts`
- Add a new `sourceFilter` parameter: `'all' | 'freestyle' | 'workflow'`
- When `'freestyle'`: skip the jobs query entirely (`skipJobs = true`)
- When `'workflow'`: skip the freestyle query entirely (`skipFs = true`)
- When `'all'`: fetch both (current behavior)

### 2. `src/pages/Jobs.tsx` (Library page)
- Add state: `const [sourceFilter, setSourceFilter] = useState<'all' | 'freestyle' | 'workflow'>('all')`
- Pass it to `useLibraryItems(sortBy, searchQuery, sourceFilter)`
- Render 3 filter chips ("All", "Freestyle", "Workflow") in the toolbar row, placed between the search bar and the sort buttons, styled consistently with the existing sort toggle pills

## Result
Users can quickly narrow their library to only freestyle creations or only workflow-generated images. The filter integrates cleanly with existing search and sort controls.

