

## Fix: Mobile Buy Credits Modal - Scrollable and Better Layout

### Problem
The Buy Credits modal on mobile/tablet is not scrollable and the plan cards don't fit on screen, creating a bad experience. The 2-column grid (`grid-cols-2`) is too cramped on small screens.

### Changes

**File: `src/components/app/BuyCreditsModal.tsx`**

1. **Make modal scrollable on mobile**: Add `max-h-[85vh] overflow-y-auto` to the DialogContent so the entire modal scrolls when content exceeds viewport height.

2. **Single-column plan cards on mobile**: Change the plan grid from `grid-cols-2 lg:grid-cols-4` to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` so plans stack vertically on phones and use 2 columns on tablets.

3. **Compact plan cards on mobile**: Reduce padding from `p-5` to `p-4 sm:p-5` for tighter mobile layout.

4. **Smaller header on mobile**: Reduce header padding for mobile to save vertical space.

### Technical Detail

| Line | Before | After |
|------|--------|-------|
| 73 | `max-w-4xl p-0 gap-0 overflow-hidden` | `max-w-4xl p-0 gap-0 overflow-hidden max-h-[85dvh] flex flex-col` |
| 112 | `px-6 pb-6 pt-5` | `px-6 pb-6 pt-5 overflow-y-auto flex-1 min-h-0` |
| 219 | `grid-cols-2 lg:grid-cols-4` | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` |

This ensures the modal is scrollable when content overflows and plan cards stack cleanly on mobile.
