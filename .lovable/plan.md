

## Fix Add to Discover modal: bigger layout, scene browser modal, and wrong-image bug

### Three fixes in this loop

---

### 1. Wrong image opens in Library lightbox (regression)

**Root cause** in `src/components/app/LibraryDetailModal.tsx`:
- `activeItem = hasMultiple ? items[currentIndex] ?? item : item` (line 59)
- `currentIndex` is reset via `useEffect(() => setCurrentIndex(initialIndex), [initialIndex, open])` (line 57)
- When the user clicks a different thumbnail in `/app/library`, parent re-renders with new `selectedItem` + new `initialIndex`. For one render cycle, `currentIndex` still holds the **previous** value → `items[currentIndex]` resolves to the wrong item (especially when the list has shifted from a refetch).
- Same root cause makes `items[currentIndex]` go stale when react-query refetches `items` while the modal is open — index now points to a different row.

**Fix**: derive the active item by **id**, not by index, and use `item` as the source of truth, with `items` only used for navigation.

```tsx
// Replace:
const activeItem = hasMultiple ? items[currentIndex] ?? item : item;

// With:
const activeItem = useMemo(() => {
  if (!hasMultiple) return item;
  // Prefer current index match, but fall back to id lookup, then to `item`
  const byIndex = items[currentIndex];
  if (byIndex && byIndex.id === item?.id) return byIndex;
  const byId = item ? items.find(i => i.id === item.id) : null;
  return byId ?? items[currentIndex] ?? item;
}, [hasMultiple, items, currentIndex, item]);

// And re-sync currentIndex whenever the parent's `item.id` changes:
useEffect(() => {
  if (!item || !hasMultiple) return;
  const idx = items.findIndex(i => i.id === item.id);
  if (idx >= 0 && idx !== currentIndex) setCurrentIndex(idx);
}, [item?.id, items, hasMultiple]); // intentionally not including currentIndex
```

This makes the modal **id-driven** instead of index-driven, eliminating the wrong-image flash and the stale-index drift after refetches.

---

### 2. Bigger "Add to Discover" modal so all info fits

**File**: `src/components/app/AddToDiscoverModal.tsx`

Currently `max-w-md` (~448px) with everything stacked → Generation Context section gets cramped, pickers get cut off. Change to a **two-column layout on md+** with a wider container, keep single column on mobile.

- Container: `max-w-md mx-4` → `max-w-3xl mx-4` (768px). Outer wrapper gains `max-h-[90vh] flex flex-col`.
- Header stays full-width.
- Below header, body becomes `grid md:grid-cols-2 gap-6` with internal scroll: `flex-1 overflow-y-auto`.
  - **Left column**: image preview (larger — `max-h-72`), Title, Tags.
  - **Right column**: Category (family + sub-row), Generation Context block (Workflow / Scene / Model / Product toggle).
- Footer (Publish button + helper text) stays full-width, sticky bottom inside the container, `border-t border-border/30 px-6 py-4`.

This gives all controls room to breathe; pickers, tag input, and category chips no longer overlap.

---

### 3. Replace 1000-row Scene popover with a category-browser modal

**Current behaviour**: Scene picker is a `<Popover>` with a single long scrollable list of ~1100 scenes (mocks + custom + product_image_scenes). That's slow to mount, slow to scroll, hides the structure.

**Fix**: Open a dedicated **`SceneBrowserModal`** when the user clicks the Scene picker (instead of the Popover) — but **only when the auto-detected scene is null** (so admins keep the fast inline picker for confirmed scenes). User can always force-open the browser via a small "Browse all scenes" button next to the picker trigger.

#### New file: `src/components/app/SceneBrowserModal.tsx`

Dedicated picker that mirrors the `/app/generate/product-images` Step-2 category structure using existing `CATEGORY_FAMILY_MAP` + `SUB_FAMILY_LABEL_OVERRIDES` from `src/lib/sceneTaxonomy.ts`.

Layout:
```text
┌───────────────────────────────────────────────────────────────┐
│ Browse Scenes                              [search…]      [×] │
├──────────────┬────────────────────────────────────────────────┤
│ FAMILIES     │  Subfamily tabs (chips):                       │
│ • Fashion    │  [All] [Garments] [Dresses] [Hoodies] …        │
│ • Footwear   │                                                │
│ • Bags       │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐               │
│ • Watches    │  │ thumb│ │ thumb│ │ thumb│ │ thumb│           │
│ • Eyewear    │  │ name │ │ name │ │ name │ │ name │           │
│ • Jewelry    │  └─────┘ └─────┘ └─────┘ └─────┘               │
│ • Beauty     │  …                                              │
│ • Home       │                                                │
│ • Tech       │                                                │
│ • Food       │                                                │
│ • Wellness   │                                                │
│ • Freestyle  │  ← non-mapped slugs grouped here               │
└──────────────┴────────────────────────────────────────────────┘
```

Behaviour:
- Reuses `useDiscoverPickerOptions(open)` — no new query, no extra fetch.
- Group `scenes` by family using `CATEGORY_FAMILY_MAP[scene.category]` → fast, in-memory, runs once.
- Left rail: family list with counts. Selecting a family scopes the right side.
- Top of right side: subfamily chips (the raw `category_collection` slugs that fall under the selected family) + an "All" chip. Labels via `getSubFamilyLabel(slug)`.
- Right side: 4-col grid of scene cards (thumbnail + name) — virtualised lightly with `max-h-[60vh] overflow-y-auto` + lazy `<img loading="lazy">`. No virtual list dependency; ~200 visible items per family is fine.
- Search bar in the header filters across the **currently selected family** (or all if no family selected) by name.
- Selecting a card calls `onSelect(scene)` and closes.
- Container: `max-w-5xl max-h-[85vh]` so it sits above `AddToDiscoverModal` without crowding.

Z-index: `z-[340]` (above the AddToDiscoverModal at `z-[300]` and its popovers at `z-[320]`).

#### Wire it into `AddToDiscoverModal.tsx`

- Add state: `const [sceneBrowserOpen, setSceneBrowserOpen] = useState(false);`
- The Scene picker trigger button now branches:
  - When `pickedSceneName` is null **and** `aiSuggestedScene` is also null → clicking the trigger opens `SceneBrowserModal` directly (skips the Popover).
  - Otherwise → keeps the existing Popover with a small "Browse all" button at its top that opens `SceneBrowserModal` (so admin can always switch to the structured picker).
- Render `<SceneBrowserModal open={sceneBrowserOpen} onClose={…} scenes={allScenes} value={pickedSceneName} onSelect={(s) => { setPickedSceneName(s.name); setSceneBrowserOpen(false); }} />` at the modal root.

#### Performance note (image appearance speed)
Yes, mounting 1000+ `<img>` tags inside a Popover slows the modal down — every popover open paints them all. The new browser modal:
- only renders the visible family's items (typically <200),
- uses `loading="lazy"` so off-screen thumbnails don't hit the network,
- mounts only when explicitly opened.

This eliminates the slowness. The inline AI-detected scene case (most common path) keeps the lightweight Popover.

---

### Files touched

```text
EDIT  src/components/app/LibraryDetailModal.tsx
        - Make activeItem id-driven (memo)
        - Re-sync currentIndex from item.id when parent changes selection

EDIT  src/components/app/AddToDiscoverModal.tsx
        - Container: max-w-3xl, max-h-[90vh], two-column body grid on md+
        - Sticky footer with Publish button
        - Scene picker: open SceneBrowserModal when scene is null;
          add "Browse all" button inside Popover for the populated case
        - State + render for SceneBrowserModal

NEW   src/components/app/SceneBrowserModal.tsx
        - Two-pane category browser (families left, grid right)
        - Reuses useDiscoverPickerOptions data; CATEGORY_FAMILY_MAP for grouping
        - Search input scoped to selected family
        - z-[340], lazy images, responsive grid
```

No DB migration. No edge function changes. No changes to `useDiscoverPickerOptions` (data is already in the right shape). No impact on `SubmitToDiscoverModal`, `DiscoverDetailModal`, freestyle gallery, or any other Library consumer.

### Validation

1. `/app/library` → click image #1 → correct image opens. Click ✕ → click image #5 → image #5 opens (not #1 flash). Trigger a refetch by submitting another generation → reopen library → no stale image.
2. Add to Discover modal opens at ~768px wide on desktop, all controls visible without inner scroll on a 1080p viewport; mobile collapses to single column.
3. Click Scene picker on an item with detected scene → fast inline Popover shows preselected scene (current behaviour). "Browse all" link inside Popover opens the browser modal.
4. Click Scene picker on an item with no scene → SceneBrowserModal opens directly with families listed.
5. Pick "Bags & Accessories" → see only ~80 scenes; subfamily chips filter to "Bags / Cardholders / Belts / Backpacks". Search "olive" filters within family.
6. Selecting a scene closes the browser, populates the picker, removes the missing-scene warning.
7. Publish — preset includes correct `scene_name` and `scene_image_url` from the picked card.
8. Other places using Popover-based scene selection (none today besides this modal) unaffected; freestyle pickers untouched.

