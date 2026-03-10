

## Remove Team Avatar from Sidebar

The sidebar team avatar widget (`SidebarTeamAvatar`) is making the sidebar feel crowded. Remove it from `AppShell.tsx`.

### Changes

**`src/components/app/AppShell.tsx`**
- Remove the `<SidebarTeamAvatar collapsed={isCollapsed} />` line from the `SidebarContent` component (appears between the Credits section and User Profile section)
- Remove the `SidebarTeamAvatar` import at the top

No other files affected. The `SidebarTeamAvatar` component file can remain in case it's useful later.

