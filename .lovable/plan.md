
## Plan to fix Freestyle upscaling visibility + broken “View in Library” behavior

### What I found
1. The upscaling status UI from your screenshot is the global progress widget (`GlobalGenerationBar`), and it is intentionally hidden on `/app/freestyle`.
2. In Library, clicking “View in Library” can appear broken when a detail modal is open, because navigation goes to the same route and does not close modal state (`selectedItem` stays set).

## Implementation plan

### 1) Show the upscaling progress widget in Freestyle
**File:** `src/components/app/GlobalGenerationBar.tsx`

- Remove `/app/freestyle` from the hard-hidden route list.
- On Freestyle specifically, only show **upscale** groups (not freestyle generation groups) to avoid duplicate progress UI (Freestyle already has its own generation status card).
- Keep existing behavior on all other routes.

Result: when user upscales from Freestyle, they’ll see the same “Luna is upscaling…” screen and running pill.

---

### 2) Fix “View in Library” so it always does something useful
**Files:**  
- `src/components/app/GlobalGenerationBar.tsx`  
- `src/pages/Jobs.tsx` (Library page)

- Add a shared “go to library” behavior in `GlobalGenerationBar`:
  - If user is **not** in Library: navigate to `/app/library`.
  - If user is **already** in Library: trigger a “focus library grid” action instead of no-op.
- In `Jobs.tsx`, listen for that action and:
  - close any open image detail modal (`selectedItem = null`),
  - refresh library data,
  - optionally scroll to top so the user sees the library grid immediately.

Result: the “View in Library” button won’t feel dead anymore, even when already on Library.

---

### 3) Keep current Freestyle upscale flow intact
No backend/database changes needed.  
No queue logic rewrite needed.  
This is a UI/state routing fix only.

## Technical details (implementation-level)
- `GlobalGenerationBar` currently uses route-based hiding; we’ll change this to conditional filtering for Freestyle.
- Add a lightweight window event (e.g. `library:focus-grid`) to bridge the global widget and Library page local state.
- Reuse existing query invalidation (`['library']`) so refreshed upscaled images appear quickly.

## Validation checklist
1. In Freestyle, open image → click Upscale → confirm upscaling widget appears.
2. From Freestyle widget, click “View in Library” → confirm navigation to Library works.
3. In Library with detail modal open, click widget “View in Library” → confirm modal closes and grid is shown/refreshed.
4. Confirm Freestyle generation progress UI is not duplicated by global widget (only upscale shown there).
