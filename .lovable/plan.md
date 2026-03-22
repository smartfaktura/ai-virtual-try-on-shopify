

# Match /app/discover with standard app page layout

## Problem
Other app pages (Products, Workflows, Dashboard) use the `PageHeader` component with left-aligned `title` + `subtitle` and consistent `space-y-6` rhythm. The Discover page currently has a centered, oversized header (`text-4xl sm:text-5xl`) that looks out of place within the app shell.

## Changes

### File: `src/pages/Discover.tsx`

1. **Use `PageHeader` component** — Replace the custom centered header with:
   ```tsx
   <PageHeader
     title="Discover"
     subtitle="Every image here was created by AI. Yours can be next."
   >
   ```
   This gives left-aligned `text-xl sm:text-2xl` title + muted subtitle, matching Products/Workflows.

2. **Move admin pending badge** into the header area (next to title or as a small badge after subtitle).

3. **Move category bar, similar-to chip, and masonry grid inside `<PageHeader>` children** — same as how Products/Workflows nest their content.

4. **Remove the custom `<div className="text-center space-y-3">` header block**.

### Result
Discover page uses the same `PageHeader` wrapper as every other app page — consistent left-aligned title, subtitle, and spacing. Category bar and content sit below in the standard layout rhythm.

