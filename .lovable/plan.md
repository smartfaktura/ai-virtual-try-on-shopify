

## Fix library lightbox arrow navigation + confirm admin actions are properly gated

### Issue 1 — Arrows do nothing (real bug)

In `src/components/app/LibraryDetailModal.tsx`:

- `goPrev` / `goNext` (lines 77–85) call `setCurrentIndex(...)` — local state only.
- But the parent (`Jobs.tsx`) passes `item={liveSelected}`, which is derived from `selectedItem` (parent state) — **the parent never learns the index changed**.
- The re-sync effect (lines 61–66) then sees that `item.id` still matches the original `selectedItem.id`, finds its index in `items`, and **snaps `currentIndex` back**. Net result: arrows visually do nothing.

This is the regression introduced when we made the modal id-driven last loop. Id-driven reconciliation works for refetches, but it now overrides arrow navigation because the source of truth (parent's `selectedItem`) isn't updated by arrows.

### Fix — lift navigation to the parent

Add an optional `onNavigate(item)` callback. When the user presses an arrow (or ←/→), the modal calls it; the parent updates `setSelectedItem(newItem)`; `liveSelected` recomputes; the modal naturally shows the new image — no fight with the re-sync effect.

**`LibraryDetailModal.tsx`**

```tsx
interface LibraryDetailModalProps {
  // …existing props
  onNavigate?: (item: LibraryItem) => void;   // NEW
}

const goPrev = useCallback(() => {
  if (!hasMultiple || !items?.length) return;
  const i = items.findIndex(x => x.id === activeItem?.id);
  const next = i > 0 ? items[i - 1] : items[items.length - 1];
  if (onNavigate) onNavigate(next);
  else setCurrentIndex(i > 0 ? i - 1 : items.length - 1); // fallback for callers without onNavigate
}, [hasMultiple, items, activeItem?.id, onNavigate]);

const goNext = useCallback(() => {
  if (!hasMultiple || !items?.length) return;
  const i = items.findIndex(x => x.id === activeItem?.id);
  const next = i < items.length - 1 ? items[i + 1] : items[0];
  if (onNavigate) onNavigate(next);
  else setCurrentIndex(i < items.length - 1 ? i + 1 : 0);
}, [hasMultiple, items, activeItem?.id, onNavigate]);
```

Compute index from the **current `activeItem.id`**, not from stale `currentIndex`, so navigation is always consistent with what's on screen even after refetches.

**`Jobs.tsx`**

```tsx
<LibraryDetailModal
  item={liveSelected}
  open={!!liveSelected}
  onClose={() => setSelectedItem(null)}
  isUpscaling={liveSelected ? upscalingSourceIds.has(liveSelected.id) : false}
  items={items}
  initialIndex={liveIndex}
  onNavigate={(next) => setSelectedItem(next)}   // NEW
/>
```

Now ← / → arrows + keyboard navigation update `selectedItem` → `liveSelected` recomputes → modal renders the new image. The re-sync effect stays a no-op (index already matches new item).

### Issue 2 — Confirm admin actions don't load before clicked

Audit of the current code (no changes needed, just confirming):

| Surface | Status |
|---|---|
| `useIsAdmin()` role check | Runs on lightbox open. Single tiny `user_roles` row lookup, cached 5 min. Required to show/hide the admin button row. **Keep — it's the minimum needed to gate UI.** |
| `AddToDiscoverModal` mount | Gated by `discoverModalOpen && item && isAdmin` (line 514). ✅ Not mounted until clicked. |
| `useDiscoverPickerOptions(open)` | All 3 queries (`product_image_scenes`, `workflows`, `useCustomScenes`, `useCustomModels`) are gated by `enabled` from previous loop. ✅ |
| `useCustomScenes({ enabled })` | Now respects `enabled`. ✅ |
| `AddSceneModal` / `AddModelModal` | Mount gated by `sceneModalUrl` / `modelModalUrl` state — only set when admin clicks. ✅ |
| `SceneBrowserModal` | Mounted inside `AddToDiscoverModal`, only rendered when scene browser opened. ✅ |

Everything else is already deferred. No additional gating required.

The one remaining call on lightbox open is the `useIsAdmin` query itself. That's a single indexed lookup against `user_roles` — keeping it is necessary because we need to know whether to render the admin button row at all. For non-admins it returns `false` and nothing else fires.

### Files touched

```text
EDIT  src/components/app/LibraryDetailModal.tsx
        - Add onNavigate?: (item) => void prop
        - goPrev/goNext: compute index from activeItem.id;
          call onNavigate when provided, fall back to local setCurrentIndex
        - Keyboard ←/→ already calls goPrev/goNext (no change)

EDIT  src/pages/Jobs.tsx
        - Pass onNavigate={(next) => setSelectedItem(next)}
```

No DB / RLS / hook / edge function changes. Other consumers of `LibraryDetailModal` (none today besides Jobs) keep working — `onNavigate` is optional, fallback path preserves the old local-state behaviour.

### Validation

1. `/app/library` → click any image with multiple in the grid → ← / → arrow buttons advance to neighbouring image. Same with keyboard ←/→.
2. Wrap-around still works (last → next goes to first; first → prev goes to last).
3. After arrow nav, opening "Add to Discover" picks up the **new** image's metadata, not the originally clicked one.
4. Submit a new generation while modal is open → list refetches → currently-shown image stays put (no flicker), arrows still navigate from the new position correctly.
5. Delete the visible image via modal Delete → modal closes (existing auto-close in Jobs).
6. Network tab as non-admin opening lightbox: zero `product_image_scenes` / `get_public_custom_scenes` / `workflows` requests. Only the small `user_roles` lookup fires.
7. As admin: same — picker queries fire only after clicking "Add to Discover".

