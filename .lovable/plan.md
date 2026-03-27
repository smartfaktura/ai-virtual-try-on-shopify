

# Fix Admin Metadata Editor UX

## Problems
1. All four Select dropdowns (Category, Workflow, Model, Scene) and the Product popover have `onPointerDownOutside={(e) => e.preventDefault()}` which prevents closing them by clicking outside. This was added to stop the modal from closing, but it also traps the user inside the dropdown.
2. The admin editor lacks useful debug info (item ID, type, poseId, slug, prompt_only status, etc.) that would help with development.

## Changes

**File: `src/components/app/DiscoverDetailModal.tsx`**

### 1. Fix dropdown dismissal (lines 290, 300, 311, 327, 368)

Remove `onPointerDownOutside={(e) => e.preventDefault()}` from all five `SelectContent` / `PopoverContent` elements. The dropdowns already render inside the modal panel (z-[300]), so clicking outside the dropdown will close the dropdown but not the modal — the modal backdrop click handler is on a separate element and the panel has `onClick={e => e.stopPropagation()}`.

### 2. Add admin debug info section

Add a compact debug info block below the "Admin: Edit Metadata" header showing:
- **Item type** (preset / scene)
- **ID** (preset id or poseId)
- **Slug** (for URL deep-linking)
- **Prompt Only** flag (for scenes)
- **Category** (current DB value)
- **Workflow slug** (current DB value)

Display these as a small grid of `text-[10px]` key-value pairs with `font-mono` styling, making it easy to inspect DB state at a glance. Include a copy-ID button.

### 3. Show current DB values vs edited values

Add subtle visual indicator (dot or color change) on the Save button when any field has been modified from its original value, so admin knows there are unsaved changes.

