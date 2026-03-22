
## What’s actually broken

I checked the current code, and the “select flashes then deselects” issue is caused by **state being reset repeatedly**, not by the dropdown UI itself.

### Root causes
1. **`selectedItem` gets reassigned repeatedly in `Discover.tsx`**
   - The URL auto-open effect runs on `[urlItemId, allItems]`.
   - `allItems` changes too often because `customScenePoses` is recreated each render.
   - That keeps replacing `selectedItem` with a fresh object, so modal edit state is reinitialized.

2. **Admin edit state in `DiscoverDetailModal` resets on any `item` reference change**
   - Current effect depends on `[item, open]`, so even same-id item object refresh resets selected values.

3. **Category appears blank for many presets**
   - DB categories include legacy values (`commercial`, `lifestyle`, `photography`, etc.) that are missing from the dropdown options.
   - When current value is not in options, Select shows empty.

## Implementation plan

### 1) Stabilize derived arrays to stop unnecessary parent churn
- **File:** `src/hooks/useCustomScenes.ts`
- Wrap `asPoses` in `useMemo` so the reference stays stable when query data didn’t change.

- **File:** `src/hooks/useCustomModels.ts`
- Do the same for `asProfiles` to reduce unnecessary re-renders in admin selectors.

### 2) Stop auto-open effect from clobbering current modal item
- **File:** `src/pages/Discover.tsx`
- Update the URL auto-open effect to only call `setSelectedItem` when the found item ID/type is actually different from the currently selected one.
- This keeps `selectedItem` stable while modal is open and user edits metadata.

### 3) Prevent admin editor from reinitializing while editing
- **File:** `src/components/app/DiscoverDetailModal.tsx`
- Change metadata init logic to run only when:
  - modal opens for a new preset id, or
  - selected item id changes.
- Do **not** reinit on same-id object reference refresh.

### 4) Fix blank category select
- **File:** `src/components/app/DiscoverDetailModal.tsx`
- Expand category options to include both current product categories and legacy discover categories:
  - `editorial`, `commercial`, `lifestyle`, `campaign`, `cinematic`, `photography`, `styling`, `ads` (plus existing ones).
- Keep current value always present in options.

### 5) Harden model/scene select display
- **File:** `src/components/app/DiscoverDetailModal.tsx`
- Add `textValue` on model/scene `SelectItem`s (with thumbnails) so Radix reliably renders selected label in trigger.

## Expected result after fix
- Selecting Category / Workflow / Model / Scene will persist in the field immediately (no flash-reset).
- Category field will show current value even for legacy presets.
- Admin metadata form remains stable until you explicitly change item or close modal.
