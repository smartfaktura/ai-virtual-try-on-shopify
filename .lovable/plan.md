

## Fix Library: stale `selectedItem`, AddToDiscoverModal mounting overhead, and Skeleton ref warning

### Root causes (real bugs found)

**1. `selectedItem` becomes stale → wrong image / "items not loading well"** (`src/pages/Jobs.tsx:718-725`)

```tsx
<LibraryDetailModal
  item={selectedItem}        // ← snapshot from useState, never updated
  items={items}              // ← live, updates on refetch / smartView change
  initialIndex={selectedItem ? items.findIndex(i => i.id === selectedItem.id) : 0}
/>
```

`selectedItem` is captured into local state on click. When react-query refetches `items` (every generation completion, every favorite toggle, every status change — the page invalidates `['library']` constantly), the `selectedItem` reference is now stale: it may reference an item that no longer exists, or one that's been replaced by an updated version. The modal's id-driven memo tries to reconcile but `item.id` keeps pointing at the old snapshot, so:
- if the refetch removed/reordered the item → `items.find(i => i.id === item.id)` returns undefined → falls back to `items[currentIndex]` which is now a **different image**.
- new items shifted into earlier indexes → `currentIndex` mismatches.

**2. `AddToDiscoverModal` always mounts → heavy fetches on every Library click** (`src/components/app/LibraryDetailModal.tsx:514`)

```tsx
{discoverModalOpen && item && ( <AddToDiscoverModal open={…} … /> )}
```

Looks gated, but `useDiscoverPickerOptions(open)` only short-circuits queries — the **hook still runs every render** of the modal subtree. More importantly, `useCustomScenes()` inside it (line 31 of the hook) is **NOT gated by `enabled`** — it always fetches `get_public_custom_scenes` whenever the AddToDiscoverModal mounts. Combined with the 200-row `product_image_scenes` fetch firing as soon as `discoverModalOpen` flips true, this slows down the library lightbox and competes with `useLibraryItems` for network.

**3. Skeleton ref warning (the console error)** (`src/components/ui/skeleton.tsx`)

Skeleton is a plain function component that doesn't forward refs. shadcn's Tooltip / Popover / Slot wrappers attempt to attach a ref to it via `asChild` chains. Doesn't crash but pollutes console and triggers React DevTools warnings during the AddToDiscoverModal render path.

---

### Fix

**A. Make `selectedItem` self-healing in `Jobs.tsx`**

Compute the live item from `items` by id — never trust the captured `selectedItem` for rendering:

```tsx
// Replace direct use of selectedItem with a reconciled "live" item
const liveSelected = useMemo(() => {
  if (!selectedItem) return null;
  return items.find(i => i.id === selectedItem.id) ?? null;
}, [selectedItem, items]);

const liveIndex = useMemo(() => {
  if (!liveSelected) return 0;
  const idx = items.findIndex(i => i.id === liveSelected.id);
  return idx >= 0 ? idx : 0;
}, [liveSelected, items]);

// If the selected item disappears from items (deleted, filtered out), close the modal
useEffect(() => {
  if (selectedItem && !liveSelected) setSelectedItem(null);
}, [selectedItem, liveSelected]);

<LibraryDetailModal
  item={liveSelected}
  open={!!liveSelected}
  onClose={() => setSelectedItem(null)}
  isUpscaling={liveSelected ? upscalingSourceIds.has(liveSelected.id) : false}
  items={items}
  initialIndex={liveIndex}
/>
```

This eliminates wrong-image flashes after every refetch / smartView change / favorite toggle, and cleanly closes the modal if the item was deleted.

**B. Guard `AddToDiscoverModal` mount + gate all picker fetches**

Two small changes:

1. In `LibraryDetailModal.tsx`, only render the modal when its trigger has fired AND the user is admin:
   ```tsx
   {discoverModalOpen && item && isAdmin && ( <AddToDiscoverModal … /> )}
   ```
   (Defensive; the trigger button is already admin-gated, but this prevents the hook tree from ever instantiating for non-admins.)

2. In `src/hooks/useDiscoverPickerOptions.ts`, **propagate `enabled`** to the custom-scenes fetch so it doesn't fire on every mount of any modal. Add a wrapper:
   ```tsx
   const { asPoses: customSceneProfiles } = enabled
     ? useCustomScenes()
     : { asPoses: [] as TryOnPose[] };
   ```
   Since hooks can't be conditional, instead pass a new `enabled` arg to `useCustomScenes({ enabled })` and gate its `useQuery` with `enabled: enabled && !!user`. (Mirror what `useCustomModels({ enabled })` already does.)

This brings the AddToDiscoverModal cold-mount from ~3 parallel queries down to 0 until the admin actually opens it, which is what was already documented in the file's JSDoc but not implemented for the scenes path.

**C. Fix the Skeleton ref warning**

Convert `src/components/ui/skeleton.tsx` to forward refs (5-line change):

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />
  )
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
```

Removes the React warning without touching any consumer.

---

### Files touched

```text
EDIT  src/pages/Jobs.tsx
        - Add liveSelected + liveIndex useMemos
        - Auto-close modal when selected item disappears from items
        - Pass liveSelected to LibraryDetailModal

EDIT  src/components/app/LibraryDetailModal.tsx
        - Add isAdmin gate to AddToDiscoverModal mount

EDIT  src/hooks/useDiscoverPickerOptions.ts
        - Pass enabled to useCustomScenes

EDIT  src/hooks/useCustomScenes.ts
        - Accept optional { enabled } arg, gate the useQuery

EDIT  src/components/ui/skeleton.tsx
        - forwardRef so Popover/Slot don't warn
```

No DB / RLS / edge function changes. No behaviour change to freestyle gallery, DiscoverDetailModal, or any other Skeleton consumer.

### Why this fixes the user's report

- "Library items not load well" → caused by `AddToDiscoverModal` firing 2-3 admin queries on every modal open, competing with the library refetch. Gating `useCustomScenes` removes that contention.
- "Wrong image opens" → the live-id reconciliation in `Jobs.tsx` keeps `item` always pointing at the actual current row, even across refetches.
- "Crashing" → the Skeleton ref warning was loud in console but the practical crash was the stale-`selectedItem` rendering an `undefined` activeItem briefly. Both now resolved.

### Validation

1. Click library image → correct image opens. Submit a generation while the modal is open → list refetches → modal still shows the same image (no flicker, no swap).
2. Delete the open image → modal closes cleanly instead of showing a stale neighbour.
3. Switch smartView (Favorites / Brand Ready) while modal is open → if the current item is filtered out, modal closes; otherwise stays on it.
4. As non-admin: open library, network tab shows zero `product_image_scenes` / `get_public_custom_scenes` requests when opening the lightbox.
5. As admin: open lightbox → no extra requests until clicking "Add to Discover" → then the 3 picker queries fire (cached 10min after).
6. No more "Function components cannot be given refs" warning when AddToDiscoverModal opens.

