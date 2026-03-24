

# Convert Earn Credits Modal to Bottom Drawer on Mobile

## Problem
On mobile, the modal pops up as a centered card. User wants it to slide up from the bottom with drag-to-dismiss, like existing mobile patterns in the app.

## Approach
Use the existing `Drawer` component (vaul) for mobile and keep `Dialog` for desktop, using `useIsMobile()` hook — same responsive pattern used elsewhere in the app.

## Changes

### `src/components/app/EarnCreditsModal.tsx`

- Import `Drawer, DrawerContent` from `@/components/ui/drawer` and `useIsMobile` from `@/hooks/use-mobile`
- Extract the shared content (hero, steps, CTA, footer) into a `const content` variable
- Conditionally render:
  - **Mobile** (`isMobile`): `<Drawer>` with `<DrawerContent>` — slides from bottom, draggable handle built-in, `max-h-[90vh] overflow-y-auto`
  - **Desktop**: Keep current `<Dialog>` with `<DialogContent>` unchanged
- The content JSX stays identical in both cases — just the wrapper changes

### Files
- `src/components/app/EarnCreditsModal.tsx` — wrap with responsive Drawer/Dialog pattern

