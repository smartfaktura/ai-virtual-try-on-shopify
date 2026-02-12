

## Fix Homepage Logo Icon Background

### The Problem

The homepage and the /app sidebar use different theme modes. The `/app` sidebar runs in **dark mode**, where `--primary` resolves to a lighter blue (`hsl(210, 17%, 70%)`). The homepage runs in **light mode**, where `--primary` resolves to a very dark navy (`hsl(217, 33%, 17%)`). That is why the "V" icon looks too dark on the homepage -- same class name, different resolved color.

### The Fix

**File: `src/components/landing/LandingNav.tsx` (line 42-43)**

Instead of relying on theme variables that change between modes, hardcode the exact lighter color used in dark mode directly on the logo icon:

- Replace `bg-sidebar-accent` with a custom background matching the /app dark-mode primary: `bg-[hsl(210,17%,70%)]` (or a close lighter shade like `bg-[hsl(222,47%,25%)]` for a subtler dark-but-not-too-dark look matching the screenshot)
- Keep `text-sidebar-foreground` (white text) so the "V" remains visible

Looking at the screenshot more carefully, the icon background is a medium-dark blue (lighter than the navbar but still dark). This matches roughly `hsl(222, 47%, 25%)` -- a lightened version of the sidebar accent.

**Change:**
- `bg-sidebar-accent` to `bg-[hsl(222,30%,25%)]`

This gives a visibly lighter background than the navbar while keeping the dark aesthetic, matching what is shown in the /app sidebar.

