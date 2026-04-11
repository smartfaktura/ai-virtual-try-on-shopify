

# Two Fixes: Remove Catalog Studio from Sidebar + Add "Reset to Draft" Option

## 1. Remove Catalog Studio from sidebar menu

**File**: `src/components/app/AppShell.tsx`
- Remove the `{ label: 'Catalog Studio', icon: LayoutTemplate, path: '/app/catalog' }` entry from the nav items array (line 60)
- Remove the BETA badge rendering logic for Catalog Studio (lines 161-164)
- Clean up unused `LayoutTemplate` import if no longer referenced

## 2. Add "Reset to Draft" option in the three-dot menu

**File**: `src/components/app/LibraryImageCard.tsx`
- Show menu items conditionally based on current `assetStatus`:
  - When `draft`: show "Brand Ready" and "Ready to Publish"
  - When `brand_ready`: show "Ready to Publish" and **"Reset to Draft"**
  - When `ready_to_publish`: show "Brand Ready" and **"Reset to Draft"**
- Add a "Reset to Draft" `DropdownMenuItem` with an `Undo2` (or `RotateCcw`) icon that calls `onSetStatus('draft')`
- This lets users unmark items from any status back to draft

