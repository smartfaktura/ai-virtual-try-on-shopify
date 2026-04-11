

# Fix Three-Dot Menu Disappearing on Click

## Problem
The hover overlay uses `group-hover:opacity-100` — when the dropdown menu opens and the mouse moves to the menu popover (which renders outside the card via a portal), the card loses hover state, the overlay fades to `opacity-0`, and the menu disappears.

## Fix — `src/components/app/LibraryImageCard.tsx`
- Add `useState` to track whether the dropdown is open
- Add `onOpenChange` to the `DropdownMenu` to set this state
- When dropdown is open, force the overlay to `opacity-100` regardless of hover (add the state class alongside `group-hover:opacity-100`)
- This keeps the overlay visible while interacting with the menu

Single file change, ~5 lines added.

