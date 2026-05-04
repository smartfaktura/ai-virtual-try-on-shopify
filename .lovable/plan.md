
## Replace inline scene outfit editors with a popup dialog

### Problem
The current inline expand/collapse per-scene editing is confusing with many scenes. Users lose context when multiple panels open/close.

### Changes in `ProductImagesStep3Refine.tsx`

**1. Convert scene rows to open a Dialog instead of expanding inline**

- Clicking a scene row sets `expandedOutfitSceneId` as before, but instead of rendering an inline expanded panel, it opens a `Dialog`
- The Dialog renders the scene thumbnail, title, status, and the `ZaraOutfitPanel` + reset/clear buttons
- "Save & Next" and "Done" buttons inside the dialog navigate to the next scene (keeping the dialog open) or close it
- Dialog uses `DialogContent` with responsive sizing: full-screen on mobile (`max-w-full h-full sm:max-w-lg sm:h-auto sm:max-h-[85vh]`), scrollable content area

**2. Remove inline expanded content**

- Remove the `{isExpanded && (...)}` block (lines 3048-3118) that renders the ZaraOutfitPanel inline
- Keep the scene row button but change it to only open the dialog (no chevron toggle)

**3. Yellow warning icon for unconfigured scenes**

- Replace the current `idx + 1` number for unconfigured scenes with an `AlertCircle` icon in amber (`text-amber-500`) so users clearly see which scenes need manual setup
- Scenes with built-in look keep the green check, scenes with custom config keep the green check
- Only scenes with `source === 'ai' && !perSceneCfg` show the amber warning icon

**4. Mobile optimization**

- Dialog: `max-w-full h-[100dvh] sm:max-w-lg sm:h-auto` with `overflow-y-auto` body
- Scene header (thumbnail + title) pinned at top of dialog
- Footer buttons (Save & Next / Done) sticky at bottom
- Touch-friendly spacing throughout

### File
- `src/components/app/product-images/ProductImagesStep3Refine.tsx`
