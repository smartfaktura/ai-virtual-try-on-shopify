

## Add "Expand" View to Scene Selector

Add a toggle button in the scene selector popover header that switches between the current compact popover view and an expanded full-screen dialog view for browsing scenes with larger thumbnails.

### Approach

**Single file change: `src/components/app/freestyle/SceneSelectorChip.tsx`**

1. **Add `expanded` state** — toggles between popover mode and dialog mode
2. **Add expand button** in the popover header (next to "Clear selection") — an `Expand` (lucide) icon button
3. **When expanded**, close the popover and open a `Dialog` instead, showing the same scene grid but with:
   - Wider layout (`max-w-3xl`)
   - Larger thumbnails in a 4-column grid (3 on mobile)
   - Taller scroll area (`max-h-[70vh]`)
   - Same filter tabs, same selection logic
4. **Minimize button** in the dialog header to go back to popover mode

The scene grid rendering logic will be extracted into a shared render function to avoid duplication between popover and dialog views. The only difference is container width, grid columns, and image size.

### UI Details

- Expand icon: `Maximize2` from lucide, placed in the header row
- Dialog title: "Scene / Environment" (same as popover)
- Grid: `grid-cols-3 sm:grid-cols-4` with `gap-2` for larger spacing
- Images: `aspect-square` stays, but naturally larger due to wider container
- Selecting a scene closes both dialog and popover

### Files
- `src/components/app/freestyle/SceneSelectorChip.tsx` — add expanded state, Dialog import, expand toggle button, shared grid renderer

