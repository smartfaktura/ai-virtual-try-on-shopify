

## Match user-menu chevron size to sidebar collapse chevron

### Find both icons
- Sidebar collapse toggle (top right of sidebar header, the `<` icon in screenshot).
- User menu chevron (the small `^` next to email at the bottom).

Both live in `src/components/app/AppShell.tsx`.

### Change
Update the user-menu chevron icon size to match the collapse toggle icon size (likely `h-4 w-4` → bump to whatever the collapse chevron uses, typically `h-5 w-5`). Also align stroke-width if different.

### Acceptance
- Chevron next to user name/email visually matches the sidebar collapse arrow in size and weight.

