Show library thumbnails directly on Step 1 of `/app/product-swap` so the user immediately sees pickable scenes, with a small initial batch and "Load more".

All edits in `src/pages/ProductSwap.tsx` only.

### Changes

1. **Show 10 library thumbnails by default on Step 1**
   - Change initial `libraryVisibleCount` from `30` to `10`.
   - "Load more" increment stays simple: bump by `10` instead of `30`.
   - On search reset, also reset to `10`.

2. **Render the library picker without requiring a source card click**
   - Currently the library grid only renders when `sceneSource === 'library'`. Drop that gate so the grid is always visible on Step 1 (still hidden once a scene is selected).
   - Keep the "Upload Image" card as a separate compact entry point above the library grid (single card, full width or aligned right) — clicking it switches to the upload dropzone view. Remove the two-card "From Library / Upload Image" chooser since Library is now the default open state.
   - Flow: page loads → user sees "Pick the scene…" heading → 10 thumbnails grid → Load more → small "Or upload your own image" link/button that reveals the dropzone.

3. **Upload entry**
   - Replace the two-card chooser with a single subtle "Upload your own image" outline button (or text link with Upload icon) placed just under the library grid heading/search row.
   - Clicking it sets `sceneSource = 'scratch'` and reveals the existing dropzone (hides the library grid while in upload mode, with a "Back to library" link to return).

### Out of scope
- No changes to product step, review step, generation, hooks, or backend.
- Library query itself untouched (already fetches up to ~400 items); only pagination/UI changes.