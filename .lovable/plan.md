

## Library Page: Add Detail Modal + Fix Missing Interactions

### Problems Identified

1. **No click-to-open modal**: `LibraryImageCard` has `cursor-pointer` but no `onClick` — clicking an image does nothing. No detail popup exists.
2. **Admin popover not working**: The `MoreHorizontal` popover is inside the hover overlay which uses `hidden [@media(hover:hover)]:flex` — it may not be accessible on touch devices and the popover interaction conflicts with the overlay.
3. **No sorting by model/scene**: The search works but there are no dedicated filter pills for model or scene.

### Solution

#### 1. Create `LibraryDetailModal` (new file)

Create `src/components/app/LibraryDetailModal.tsx` — a fullscreen detail modal inspired by `DiscoverDetailModal` but tailored for library items:

- **Left side**: Large image preview (60% width on desktop)
- **Right side**: Info panel with:
  - Source badge (Freestyle / workflow name)
  - Prompt text (if available)
  - Date created
  - Aspect ratio / quality metadata
  - Action buttons: Download, Delete (freestyle only)
  - Admin-only actions: Add as Scene, Add as Model
- **Close on Escape** and backdrop click
- Same dark backdrop styling as Discover (`bg-black/90`)

#### 2. Update `LibraryImageCard` to accept `onClick` prop

- Add `onClick` prop to `LibraryImageCardProps`
- Wire the card's root `div` to call `onClick`
- Remove the admin popover and complex hover actions from the card — all actions move to the detail modal
- Keep only a minimal hover overlay with badge and date (clean look)

#### 3. Update `Jobs.tsx` to manage selected item state

- Add `selectedItem` state
- Pass `onClick` to each `LibraryImageCard`
- Render `LibraryDetailModal` with the selected item
- Pass download/delete/admin handlers to the modal

#### 4. Remove source filter tabs (already done), keep search improvements

- Search already works by product, model, scene
- No additional filter pills needed — the search covers it

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/app/LibraryDetailModal.tsx` | **Create** — fullscreen detail modal for library items |
| `src/components/app/LibraryImageCard.tsx` | **Modify** — add `onClick` prop, simplify hover overlay (remove popover, move actions to modal) |
| `src/pages/Jobs.tsx` | **Modify** — add `selectedItem` state, render `LibraryDetailModal` |

### Technical Details

**LibraryDetailModal layout** (mirrors DiscoverDetailModal):

```
+------------------------------------------+
|  [Image 60%]     | [Info Panel 40%]      |
|                  |  Source: Freestyle     |
|                  |  "prompt text..."      |
|                  |  Feb 9, 2026           |
|                  |                        |
|                  |  [Download] [Delete]   |
|                  |                        |
|                  |  Admin:                |
|                  |  [Add as Scene]        |
|                  |  [Add as Model]        |
|                  |                   [X]  |
+------------------------------------------+
```

**LibraryImageCard** simplified to:
- Image with shimmer placeholder
- Hover overlay: source badge (top-left), date (bottom-left) — no action buttons
- `onClick` triggers parent to open modal

**Jobs.tsx** additions:
```tsx
const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

// In render:
<LibraryImageCard 
  key={item.id} 
  item={item} 
  onClick={() => setSelectedItem(item)} 
/>

<LibraryDetailModal
  item={selectedItem}
  open={!!selectedItem}
  onClose={() => setSelectedItem(null)}
/>
```
