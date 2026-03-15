

## Fix Reference Upload Box & Remove Standard Quality

### Changes to `src/pages/Perspectives.tsx`

#### 1. Reference upload box — match parent card styling + add paste support
The reference upload area (lines 568-605) is a small `ml-12` indented box with minimal styling. It needs to:
- Remove `ml-12` indent so it visually aligns with the parent variation card
- Match the parent card's width and border-radius styling (rounded-xl, proper padding)
- Add a proper drag-and-drop zone with icon, text, and paste support (Cmd+V / Ctrl+V)
- Show a proper preview when uploaded (larger thumbnail, better layout)
- Add clipboard paste listener scoped to when a variation with ref upload is selected
- Apply the same treatment to the non-recommended reference upload section (lines 608-642)

#### 2. Remove Standard quality option
- Remove the entire "Step 4: Quality" section (lines 673-695)
- Hardcode `quality` to `'high'` (already default)
- Remove the `quality` state setter since it's always `'high'`
- Update the cost display — `perImageCost` is always 8, no toggle needed
- Renumber Step 3 (Aspect Ratios) stays as 3, the generate bar remains

#### 3. Add paste event handler for reference images
- Add a `useEffect` that listens for paste events when a variation with `referenceUpload` is selected
- On paste, upload the pasted image as a reference for the most recently selected variation that still needs a reference
- Show paste hint text in the upload zone (like the main UploadSourceCard does)

### Files changed
| File | Change |
|------|--------|
| `src/pages/Perspectives.tsx` | Redesign reference upload zones, add paste support, remove quality section |

