

## Add Bottom Tab Bar for App Navigation on Mobile

Replace the floating hamburger menu on mobile with a fixed bottom tab bar — the standard mobile app navigation pattern.

### Design

The bottom tab bar will show 5 key icons (the most common limit for tab bars):

| Tab | Icon | Route |
|-----|------|-------|
| Home | Home | /app |
| Products | Package | /app/products |
| Generate | Sparkles | /app/freestyle |
| Library | Image | /app/library |
| More | Menu | Opens the existing slide-out sidebar |

The "More" tab opens the full sidebar overlay for access to all other sections (Workflows, Creative Drops, Discover, Video, Brand Profiles, Settings, Sign out).

### Visual Style
- Fixed to bottom of screen, full width
- Dark background matching the sidebar (`bg-sidebar`)
- Safe area padding for phones with home indicators (iOS notch)
- Active tab highlighted with primary color
- Small icon + label text for each tab

### Technical Changes

**1. New component: `src/components/app/MobileTabBar.tsx`**
- Renders only on mobile (`lg:hidden`)
- 5 tab buttons with icons and labels
- "More" tab triggers the sidebar open callback
- Active state detection using `useLocation`

**2. Update: `src/components/app/AppShell.tsx`**
- Import and render `MobileTabBar` at the bottom of the layout
- Pass `setSidebarOpen` to `MobileTabBar` for the "More" tab
- Remove the floating hamburger button (replaced by the tab bar)
- Add `pb-16 lg:pb-0` to main content area so content isn't hidden behind the tab bar

**3. Update: `src/pages/Freestyle.tsx`**
- Adjust the prompt bar's bottom position on mobile to account for the tab bar height (`bottom-16` instead of `bottom-0` on mobile)

