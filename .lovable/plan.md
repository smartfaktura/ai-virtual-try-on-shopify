

## Fix Dashboard Recent Creations — Tap-to-Reveal + Open Specific Item

### Problem
1. On mobile, single-tap immediately navigates away — accidental taps while scrolling trigger navigation constantly
2. Clicking any card navigates to `/app/library` generically instead of opening that specific image

### Changes

**`src/components/app/RecentCreationsGallery.tsx`**

**1. Add tap-to-reveal pattern (mobile):**
- Track `activeItemId` state — which card currently shows the "View" overlay
- First tap on a card sets it as active (shows the View button overlay), does NOT navigate
- Second tap (on the already-active card) opens the detail modal
- Tapping a different card switches the active highlight
- On desktop (hover-capable), keep the existing hover behavior — single click opens
- Use a pointer-down + click approach similar to `WorkflowRecentRow`'s swipe threshold to distinguish scroll from tap

**2. Open specific item in `LibraryDetailModal` instead of navigating to `/app/library`:**
- Import `LibraryDetailModal` and `LibraryItem` type
- Add `selectedItem` state holding a `LibraryItem | null`
- When a card is confirmed (second tap on mobile, single click on desktop), build a `LibraryItem` from the `CreationItem` data and set it as `selectedItem`
- Render `<LibraryDetailModal>` at the bottom of the component
- Remove the generic `navigate('/app/library')` call

**3. Add `source` field to `CreationItem`:**
- Extend `CreationItem` with `source: 'generation' | 'freestyle'` so we can map it to `LibraryItem.source`
- Set source during the fetch logic (jobs → `'generation'`, freestyle → `'freestyle'`)

### Behavior Summary
- **Mobile**: Tap card → overlay appears with "View" button → tap again → modal opens showing that image
- **Desktop**: Hover shows overlay (unchanged) → click → modal opens showing that image
- **Placeholder cards** (curated scenes): Keep existing behavior — navigate to freestyle with scene pre-selected

