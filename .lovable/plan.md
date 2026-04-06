

# Flip "Exclude" to "Show in Categories" (Include-based UI)

## Problem
The current UI says "Exclude from Categories" — you check boxes for categories that should NOT see this scene. This is confusing because you have to think in negatives. Much easier to check which categories SHOULD see the scene.

## Solution
Flip the checkbox UI to **"Show in Categories"** with an inverted logic:
- Checkboxes represent categories where the scene IS visible
- All categories start checked (scene visible everywhere)
- Unchecking a category adds it to `exclude_categories` in the database
- No database changes needed — just invert the UI logic

## Changes

**`src/pages/AdminProductImageScenes.tsx`**:

1. Rename label from "Exclude from Categories" to **"Show in Categories"**
2. Invert checkbox logic:
   - Currently: `checked = exclude_categories.includes(cat)` (checked = hidden)
   - New: `checked = !exclude_categories.includes(cat)` (checked = visible)
3. Invert toggle: unchecking adds to `exclude_categories`, checking removes from it
4. Add a subtle helper: "Uncheck categories where this scene should be hidden"
5. Add quick actions: **"All"** / **"None"** buttons to bulk toggle

The "Appears in" badges in the list view already show the positive framing, so those stay as-is.

