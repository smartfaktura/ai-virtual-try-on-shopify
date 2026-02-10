

## Library Page Improvements

Four changes to implement:

---

### 1. Replace large admin buttons with a compact popover menu

**Problem**: The admin action buttons (Add as Scene, Add as Model) are oversized and clutter the hover overlay.

**Solution**: Replace inline admin buttons with a single small "..." (MoreHorizontal) icon button. Clicking it opens a dropdown/popover with all actions (Add as Scene, Add as Model, Download, Delete) in a clean list format with labels.

**Changes to `LibraryImageCard.tsx`:**
- Import `MoreHorizontal` from lucide and `Popover`/`PopoverContent`/`PopoverTrigger` from radix
- Replace the current button row with: for non-admin users, keep download + delete as small overlay buttons; for admin users, show a single "..." button that opens a popover with labeled action items:
  - "Add as Scene" (Camera icon)
  - "Add as Model" (User icon) 
  - "Download" (Download icon)
  - "Delete" (Trash icon, only for freestyle)
- Each popover item: clean row with icon + text label, hover highlight

---

### 2. Fix masonry grid to match Discover (round-robin column distribution)

**Problem**: Library uses CSS `columns` which stacks items top-to-bottom in each column. Discover already switched to JS-based round-robin flex columns.

**Solution**: Apply the same `useColumnCount` hook and round-robin distribution pattern from Discover to Library.

**Changes to `Jobs.tsx`:**
- Add the same `useColumnCount` hook (or extract to shared hook)
- Replace `<div className="columns-2 sm:columns-3 ...">` with the flex-based round-robin column layout matching Discover exactly
- Remove the `max-w-7xl` container wrapper and use `px-1` like Discover for edge-to-edge feel

---

### 3. Remove "Generations" and "Freestyle" filter tabs, keep only sorting

**Problem**: User doesn't want source-type filtering (Generations/Freestyle).

**Solution**: Remove the TABS array and tab state. Keep only "Newest"/"Oldest" sort pills. Always fetch all items.

**Changes to `Jobs.tsx`:**
- Remove `TABS` array, `tab` state, and all tab-related buttons
- Remove the `displayItems` filter (just use `items` directly)
- Keep sort pills (Newest/Oldest)

**Changes to `useLibraryItems.ts`:**
- Remove `LibraryTab` type
- Remove `tab` parameter, always fetch both generation jobs and freestyle
- Simplify the hook signature to just `(sortBy, searchQuery)`

---

### 4. Improve search to match product name, model name, and scene name

**Problem**: Current search only matches `label` and `prompt_final`. Users want to search by product, model, or scene used in generation.

**Solution**: The `prompt_final` field already contains model and scene names (e.g., "Virtual Try-On: Ingrid in Basketball Court pose"). The current search already checks `prompt_final`. Additionally, the `label` comes from `workflows.name` or `user_products.title`. 

To improve, we also join `user_products.title` for product name matching and make the search placeholder clearer.

**Changes to `useLibraryItems.ts`:**
- Include `user_products(title)` in the generation_jobs select (already there)
- When filtering by search, also check against the product title separately
- Search freestyle items against prompt text

**Changes to `Jobs.tsx`:**
- Update search placeholder to: "Search by product, model, scene..."

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Jobs.tsx` | Remove tabs, add round-robin flex layout, update search placeholder, remove max-w wrapper |
| `src/components/app/LibraryImageCard.tsx` | Replace inline admin buttons with popover menu containing labeled actions |
| `src/hooks/useLibraryItems.ts` | Remove tab parameter, always fetch all, improve search matching |

### Technical Details

**Popover menu for admin actions:**
```tsx
<Popover>
  <PopoverTrigger asChild>
    <button className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-white/20">
      <MoreHorizontal className="w-4 h-4" />
    </button>
  </PopoverTrigger>
  <PopoverContent className="w-40 p-1" side="top">
    <button className="flex items-center gap-2 w-full px-3 py-2 text-xs rounded hover:bg-muted">
      <Camera className="w-3.5 h-3.5" /> Add as Scene
    </button>
    <button className="flex items-center gap-2 w-full px-3 py-2 text-xs rounded hover:bg-muted">
      <User className="w-3.5 h-3.5" /> Add as Model
    </button>
    <button className="flex items-center gap-2 w-full px-3 py-2 text-xs rounded hover:bg-muted">
      <Download className="w-3.5 h-3.5" /> Download
    </button>
  </PopoverContent>
</Popover>
```

**Round-robin layout (matching Discover):**
```tsx
const columnCount = useColumnCount();
const columns = Array.from({ length: columnCount }, () => []);
items.forEach((item, i) => { columns[i % columnCount].push(item); });

<div className="flex gap-1">
  {columns.map((col, i) => (
    <div key={i} className="flex-1 flex flex-col gap-1">
      {col.map(item => <LibraryImageCard key={item.id} item={item} />)}
    </div>
  ))}
</div>
```
