

# Fix Results Page: Download, Selection Bar, and Cleanup

## Issues
1. **Download All broken** — downloads images one-by-one (triggers popup blockers, slow). Should ZIP like Library.
2. **Select All has no floating action bar** — should show a compact floating bar like Library page with "X selected" + "Download ZIP" (no Enhance 2K/4K for workflow).
3. **Label text still visible** — "Product — 9:16 · full body" text still renders above grid from `workflowVariationLabels`. Remove it entirely.

## Changes

### File: `src/pages/Generate.tsx`

1. **Fix `handleDownloadAll`** — replace sequential download with JSZip bulk download (same pattern as Library page). Already imports JSZip.

2. **Remove label rendering** — ensure no `workflowVariationLabels` text is rendered in the results section. The label "Žiedas su deimantais — 9:16 · full body" visible in screenshot needs to be removed if still present.

3. **Add floating selection bar** — when `selectedForPublish.size > 0`, show a fixed bottom bar:
   - "X selected" count
   - "Download ZIP" button (uses JSZip)
   - Close button to deselect all
   - No "Enhance 2K/4K" button (workflow context)

4. **Simplify top action buttons** — keep Select All / Deselect All, Adjust, Start Over. Replace "Download All" with ZIP-based download. Remove "Download Selected" from bottom section since the floating bar handles it.

### Files
- `src/pages/Generate.tsx` only

