

## Remove Publishing Selection UI, Keep Download Options

### What Changes

Remove the "Click on images to select for publishing" alert, the "Selected: 0 of 4" counter, and the "Select All" / "Clear" buttons from the try-on results view. The selection checkboxes on images and the bottom download buttons ("Download All", "Download Selected") will remain so users can still pick and download individual images or all as a batch.

### Files to Change

**`src/pages/Generate.tsx` (~lines 1558-1567)**

Remove these elements:
- The Alert saying "Click on images above to select them for publishing" (lines 1558-1560)
- The "Selected: X of Y" text + "Select All" / "Clear" buttons row (lines 1561-1567)

The image selection checkboxes (line 1551-1553) and the bottom action bar with "Download All", "Download Selected", and "View in Library" (lines 1587-1597) all stay as-is.

