

## Fix Hover Card Position on Sidebar Team Avatar

Change the `TeamAvatarHoverCard` `side` prop from `"right"` to `"top"` in both the collapsed and expanded states of `SidebarTeamAvatar.tsx`. This will make the card appear above the avatar instead of overlapping the sidebar or main content.

**File:** `src/components/app/SidebarTeamAvatar.tsx`
- Line 29: Change `side="right"` → `side="top"`
- Line 50: Change `side="right"` → `side="top"`

Two single-prop changes, no other files affected.

