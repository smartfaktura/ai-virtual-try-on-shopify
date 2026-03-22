

# Consolidate Admin Controls into Single Section

## Problem
The category selector sits above the title as a near-invisible dashed element, and the metadata editor is a separate block further down. The user wants all admin editing (category + model/scene) merged into one compact admin section.

## Changes

### `src/components/app/DiscoverDetailModal.tsx`

1. **Remove the standalone category selector** (lines 149-172) from above the title.

2. **Merge category into the metadata editor block** (lines 242-303): Add the category dropdown as a third select in a `grid-cols-3` layout alongside Model and Scene selectors. Include category in the save handler so all three update in one click.

3. **Add local state for category**: `editCategory` initialized from `item.data.category`, included in the save update payload.

4. **Move the combined admin block below the "Created with" section** (where it already is) — this keeps the title clean and groups all admin controls together.

### Result layout (admin only):
```text
┌─ ADMIN: EDIT METADATA ──────────────────────┐
│  [Category ▼]  [Model ▼]  [Scene ▼]         │
│  [        Save metadata        ]             │
└──────────────────────────────────────────────┘
```

One file, ~20 lines changed. Category selector removed from top, merged into metadata editor grid.

