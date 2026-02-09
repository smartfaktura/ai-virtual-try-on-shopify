

## Move Brand Profiles to Configuration Section

### Problem
Brand Profiles is a one-time setup item, not a daily-use feature. It's cluttering the main navigation alongside high-frequency items like Dashboard, Products, and Workflows.

### Change

**File: `src/components/app/AppShell.tsx`**

Move the "Brand Profiles" entry from the `navItems` array to the `configItems` array, placing it above Settings. This puts it in the "Configuration" section of the sidebar where it logically belongs as a setup-once feature.

Before:
- **Main**: Dashboard, Products, Brand Profiles, Workflows, Creative Drops, Templates, Video, Freestyle, Library
- **Configuration**: Settings

After:
- **Main**: Dashboard, Products, Workflows, Creative Drops, Templates, Video, Freestyle, Library
- **Configuration**: Brand Profiles, Settings

One line moved from one array to another -- no other files affected.

