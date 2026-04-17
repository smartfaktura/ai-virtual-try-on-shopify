

## Goal
Move **Tutorials** and **Help & Support** out of the sidebar's "Learn" group and into the user account menu (the popover that opens when clicking the user chip at the bottom of the sidebar). This declutters the sidebar and groups personal/utility items together.

## Changes — single file: `src/components/app/AppShell.tsx`

### 1. Remove the "Learn" sidebar group
Delete the entire `Learn` group from the nav config (lines 78–84):
```
{ label: 'Learn', items: [Tutorials, Help & Support] }
```
Sidebar now ends with **Assets** group → cleaner, shorter nav.

### 2. Add both items into the user dropdown menu
Insert two new menu buttons in the user popover (between "Brand Profiles" and "Earn Credits") so the order becomes:

```
ievute040
ievute040@gmail.com
─────────────────
⚙  Account settings
🎨  Brand Profiles
🎓  Tutorials          ← new
🛟  Help & Support     ← new
🎁  Earn Credits
─────────────────
(admin items if admin)
─────────────────
↪  Sign out
```

Each new button mirrors the existing pattern:
- `GraduationCap` icon → navigates to `/app/learn`
- `LifeBuoy` icon → navigates to `/app/help`
- Closes the menu on click (`setUserMenuOpen(false)`)

Imports `GraduationCap` and `LifeBuoy` are already in the file (used by the now-removed Learn group), so no import changes needed beyond keeping them.

### 3. No other files touched
- Routes for `/app/learn` and `/app/help` stay as-is
- Prefetch entries stay
- No content changes to either page

## Acceptance
- Sidebar no longer shows "LEARN" section header or its two items
- Clicking the user chip at the bottom opens the menu shown in the user's screenshot, now with **Tutorials** and **Help & Support** added between Brand Profiles and Earn Credits
- Both menu items navigate correctly and close the popover
- Collapsed sidebar still works (no leftover empty group)
- Mobile drawer reflects the same change

