
## Match Homepage Logo Icon to /app Sidebar

The `/app` sidebar logo uses a blue primary-colored icon box, while the homepage nav currently uses a gray accent background. This will make them identical.

### What Changes

**File: `src/components/landing/LandingNav.tsx` (line 43-44)**

Update the logo icon container to match the `/app` sidebar exactly:
- Background: `bg-sidebar-accent/80` to `bg-primary`
- Text color: `text-sidebar-foreground` to `text-primary-foreground`
- Size: `w-9 h-9` to `w-8 h-8`
- Border radius: `rounded-xl` to `rounded-lg`
- Font size: `text-base` to `text-sm`

This produces the same blue square with white "V" seen in the `/app` sidebar.
