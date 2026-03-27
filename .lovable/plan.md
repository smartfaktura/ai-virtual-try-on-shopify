

# Improve Scene Selection — Full Dialog with Search and Larger Thumbnails

## Problem
The current scene selector in the Discover Detail Modal is a small `<Select>` dropdown with tiny 20×20px thumbnails, no search, and limited scrolling. With many scenes it's hard to find the right one.

## Solution
Replace the `<Select>` with a button that opens a `<Dialog>` containing:
- A search input to filter scenes by name
- A grid of scene cards with larger thumbnails (~80×100px, 4:5 aspect ratio)
- Grouped by category (like the SceneSelectorChip expanded view)
- A "None" option to clear selection

## Changes

### `src/components/app/DiscoverDetailModal.tsx`

1. **Add state**: `sceneDialogOpen` boolean, `sceneSearch` string
2. **Replace the Scene Selection `<Select>`** (lines 397-412) with:
   - A trigger button showing the current scene name + thumbnail (or "None")
   - A `<Dialog>` with search input and a grid of scene cards
3. **Dialog content**:
   - Search input at top filtering `allSceneOptions` by name
   - Grid layout (3-4 columns) with scene images at ~4:5 aspect ratio
   - Category grouping using `poseCategoryLabels` from mockData
   - Click selects and closes dialog
4. **Import `Dialog, DialogContent, DialogTitle`** (already available in the project)

Single file change, ~60 lines added/modified.

