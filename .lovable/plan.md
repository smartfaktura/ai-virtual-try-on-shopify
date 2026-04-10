

# Improve Admin Scene Creation UX

## Changes

### 1. Add "＋ New Scene" button per category section
In the category header row (line ~357), add a small "＋ New" button next to the category label. Clicking it opens the add-new form pre-filled with that category's `category_collection` value, so admins don't have to select the category manually.

### 2. Sub-Category: dropdown with existing values + "Create new"
Replace the free-text `<Input>` for Sub-Category (line ~628) with a `<Select>` that:
- Lists all existing sub-category values from the current scenes (e.g. "Essential Shots", "Hero Scenes", "Editorial", etc.)
- Has a "＋ Create new..." option at the bottom
- When "Create new" is selected, shows a text input to type a new name
- Prevents typos and inconsistencies

### File
- `src/pages/AdminProductImageScenes.tsx`

### Technical details

**Per-category "New Scene" button:**
- Add a `<Button>` in the category header (inside `CollapsibleTrigger`'s sibling, using `e.stopPropagation()` to avoid toggling the collapsible)
- On click: set `addingNew = true`, pre-fill `newDraft` with `category_collection: key` and `category_sort_order` from the group

**Sub-Category dropdown:**
- Compute `allSubCategories` from `rawScenes` — a deduplicated, sorted list of all non-empty `sub_category` values
- In `SceneForm`, replace the Input with a Select + conditional Input combo
- Select options: existing sub-categories + "＋ Create new..."
- When "＋ Create new..." is picked, show an Input; the typed value becomes the new `sub_category`

