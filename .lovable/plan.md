

## Enable favorite + status actions on mobile in /app/library

### Issue
On mobile (`/app/library`), users can't:
1. Favorite an image
2. Mark as Brand Ready / Ready to Publish

### Root cause
In `src/components/app/LibraryImageCard.tsx`, the entire action overlay (favorite heart + three-dot status menu + download) is wrapped in:
```tsx
className="... hidden [@media(hover:hover)]:flex"
```
That `[@media(hover:hover)]` query only matches devices with a real hover capability — i.e. desktop with a mouse. On touch devices (phones/tablets) the overlay is permanently hidden, so there is no way to tap the heart or the three-dot menu.

There's no fallback long-press, no tap-to-reveal, no persistent action row for mobile.

### Plan

**1. `src/components/app/LibraryImageCard.tsx` — make actions accessible on touch**

Replace the hover-only overlay with a responsive pattern:
- **Desktop (hover:hover)**: keep existing behavior — overlay appears on hover (or when menu is open).
- **Touch devices**: render a persistent, lightweight action row — a small heart button (top-right) and a three-dot menu button (top-left) — both sitting on a soft gradient/scrim so they read on any image. Tapping the three-dot opens the same `DropdownMenu` with Brand Ready / Ready to Publish / Reset to Draft. Tapping the heart toggles favorite.
- Hide the persistent touch row when `selectMode` is active (checkbox takes over) or when `isUpscaling`.
- Keep the bottom status pill + date + download visible on hover for desktop; on mobile, surface the small status pill as a corner badge when `assetStatus !== 'draft'` so users see state at a glance, and put download inside the three-dot menu (new "Download" item) so a single mobile menu covers all actions.

**2. Mobile menu additions**
Add `Download` as a `DropdownMenuItem` in the same status menu so mobile users get download parity without needing the hover overlay.

### Technical notes
- Use Tailwind's `[@media(hover:none)]:flex` + `[@media(hover:hover)]:hidden` to scope the persistent touch row, mirroring the existing inverse query on the hover overlay. No JS device detection needed — pure CSS, SSR-safe.
- All buttons keep `e.stopPropagation()` so they don't trigger the card's `onClick` (which opens the lightbox).
- No changes to data hooks (`useLibraryFavorites`, `useLibraryAssetStatus`) — purely a UI accessibility fix.

### Files
- `src/components/app/LibraryImageCard.tsx` — add persistent touch action row, add Download to status menu

### Acceptance
- On mobile `/app/library`, tapping the heart on a card toggles favorite (filters under "Favorites" tab update).
- On mobile, tapping the three-dot opens menu with Brand Ready / Ready to Publish / Reset to Draft / Download — selecting an option updates the card and the corresponding tab filter.
- Desktop hover behavior unchanged.
- Select mode and upscaling overlay still hide the touch action row.
- Status badge visible at-a-glance on mobile when not draft.

