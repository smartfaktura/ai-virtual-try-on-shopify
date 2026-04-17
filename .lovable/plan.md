

## Downsize `PageHeader` title to match dashboard section-heading style

User wants the `/app/workflows` page header (and all PageHeader users) to match the dashboard **section** heading style (e.g. "Steal the Look", "Create Video"), not the giant dashboard welcome h1.

### Target style (from dashboard sections)
- Heading: `text-2xl sm:text-3xl font-bold tracking-tight`
- Subtitle: `text-base text-muted-foreground mt-1.5` (no `sm:text-lg` bump, no `max-w-lg` clip)

### Change
**File:** `src/components/app/PageHeader.tsx`
- Line 24: `text-3xl sm:text-4xl` → `text-2xl sm:text-3xl`
- Line 29: `text-base sm:text-lg text-muted-foreground mt-2 max-w-lg` → `text-base text-muted-foreground mt-1.5`

### Acceptance
- `/app/workflows` page title + subtitle visually match dashboard section blocks like "Steal the Look" / "Create Video".
- No giant welcome-style h1 on workflows page.
- Subtitle is single-line scale (`text-base`) at every breakpoint, sitting tight (`mt-1.5`) under the title.

