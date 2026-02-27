

## Three Changes for Interior / Exterior Staging

### 1. Limit to 1 Style Selection (Single Image per Generation)

Currently, users can select multiple design styles. We'll restrict Interior/Exterior Staging to only allow 1 style at a time.

**File: `src/pages/Generate.tsx`**
- In the variation card click handler (~line 1833-1846), when `isInteriorDesign`, replace the toggle logic with single-select: clicking a style replaces the previous selection instead of adding to it.
- Update the "Select All" / "Deselect All" button to be hidden for interior design.
- Update the description text from "Choose 1-3 design styles" to "Choose 1 design style".
- Update the generate button text to say "Generate 1 Image" instead of showing count.

### 2. Remove Emojis from Workflow Steps

The emojis in the staging settings section come from the code, not the database.

**File: `src/pages/Generate.tsx`**
- Line 1729: Remove the emoji from the Badge: `🏠 Interior` -> `Interior`
- Line 2157: Remove emoji from heading: `🏠 Staging Settings` -> `Staging Settings`  
- Lines 2167-2168: Remove emojis from interior/exterior toggle buttons: `🏠` and `🏡` -> use icons or just text

### 3. Reorder Steps: Interior/Exterior Choice Comes First

Currently the flow is: Upload Photo -> Brand -> Settings (which contains interior/exterior toggle, room type, styles all in one). The user should choose interior vs exterior **before** uploading a photo and setting details.

**New flow:**
1. **Type** -- Interior or Exterior (new first step)
2. **Upload Photo** -- Upload room/building photo + set room type, wall color, flooring
3. **Brand** -- Brand profile (if any)
4. **Style** -- Select 1 design style
5. **Generate** -- Quality settings + generate button

**File: `src/pages/Generate.tsx`**

- Update `getSteps()` for `isInteriorDesign` to: `[{ name: 'Type' }, { name: 'Upload Photo' }, { name: 'Brand' }, { name: 'Style' }, { name: 'Results' }]`
- Update `getStepNumber()` for interior design mapping
- Remove the `useEffect` that auto-skips source step (line 293-298). Instead, set initial step to `'source'` and show the Interior/Exterior toggle there.
- Move the Interior/Exterior toggle out of the settings card and into the `source` step for interior design.
- Move Room Type, Wall Color, Flooring selectors to the `upload` step (shown below the upload card, after the user uploads a photo).
- In settings step, only show style selection + quality + generate.

### Technical Summary

All changes are in a single file: `src/pages/Generate.tsx`. The changes involve:
- Reordering UI sections (moving interior/exterior toggle to source step, room details to upload step)
- Changing multi-select to single-select for style variations
- Removing emoji characters from headings and badges
- Updating step definitions and step number mapping

