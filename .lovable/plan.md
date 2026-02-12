

## Fix /app Mobile Navigation

### Problems Identified
1. **Bottom tab bar overlaps** with the StudioChat floating button (both at the bottom)
2. **No logo visible** on mobile -- there's no header bar at all
3. **No active tab indicator** -- icons are too dark/invisible against the background  
4. **No "floating" style** matching the desktop sidebar aesthetic

### Solution

Replace the bottom tab bar with a **floating top header bar** on mobile, matching the desktop floating sidebar style.

### Changes

**1. Delete `src/components/app/MobileTabBar.tsx`**
- Remove the bottom tab bar entirely

**2. Update `src/components/app/AppShell.tsx`**
- Remove `MobileTabBar` import and usage
- Add a mobile-only floating top header (`lg:hidden`):
  - Floating card style: `m-3 rounded-2xl border border-white/[0.06] bg-sidebar shadow-lg` (matches desktop sidebar)
  - Logo "V" + "VOVV.AI" on the left
  - Hamburger icon on the right to open sidebar overlay
  - Compact height (~h-14)
- Change main content padding from `pb-20 lg:pb-8` to just `p-4 sm:p-6 lg:p-8` (no extra bottom padding needed)
- Add `pt-[76px] lg:pt-0` to main content on mobile to clear the floating header

**3. Update `src/pages/Freestyle.tsx`**
- Revert prompt bar bottom positioning from `bottom-16 lg:bottom-0` back to `bottom-0` everywhere (no tab bar to dodge)

**4. Move StudioChat FAB higher on mobile** (in `src/components/app/StudioChat.tsx`)
- Keep it at `bottom-4 right-4` -- with no tab bar it won't overlap anymore

### Visual Result (Mobile)

```text
   +------------------------------+
   |  [V] VOVV.AI          [=]   |  <-- floating header (rounded, matches desktop)
   +------------------------------+
   |                              |
   |       Page Content           |
   |       (scrollable)           |
   |                              |
   |                       [chat] |  <-- StudioChat FAB, no overlap
   +------------------------------+
```

Tapping the hamburger opens the full sidebar overlay with all nav items, user profile, credits, and sign out.

