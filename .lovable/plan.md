
## Changes

### 1. Hide horizontal sub-category pills on desktop (ProductVisualLibrary.tsx)

The `FamilySection` component renders horizontal pill filters (lines 429-501) with `hidden lg:block`. Since the sidebar already shows all categories and sub-categories on desktop (lg+), these pills are redundant. Change the visibility to show only on mobile/tablet where the sidebar is hidden:

- Change the pill container from `hidden lg:block` to `lg:hidden` (visible below lg, hidden at lg+ where sidebar is visible)
- Also hide the pill skeleton row (line 214) which currently shows `hidden lg:flex` — remove or hide it entirely

### 2. Improve sidebar hover/active styling (LibrarySidebarNav.tsx)

Update the main category and sub-category button styles for a more polished look:

- **Active family (no sub selected):** Keep solid dark bg (`bg-foreground text-background`)
- **Active family (sub selected):** Use a subtle primary tint instead of `bg-foreground/[0.08]` — e.g. `bg-primary/10 text-primary font-semibold`
- **Hover on inactive family:** Use `hover:bg-primary/[0.06] hover:text-primary` for a warmer, branded feel
- **Active sub-category:** Use `bg-primary text-white` instead of `bg-foreground text-background` for visual distinction from parent
- **Hover on inactive sub:** Use `hover:bg-primary/[0.06] hover:text-primary`

These changes give the sidebar a cohesive primary-color accent system that differentiates parent from child selections.
