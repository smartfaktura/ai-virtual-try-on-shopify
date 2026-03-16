

## Plan: Collapsible model filters on mobile

On mobile, the `ModelFilterBar` takes up significant vertical space. We'll make it collapse into a compact, stylish trigger button on mobile that expands to reveal filters when tapped. On desktop it stays always visible.

### Changes

**File: `src/components/app/ModelFilterBar.tsx`**

1. Add `useState` for `open` (default `false`) and import `useIsMobile`, `Collapsible`/`CollapsibleTrigger`/`CollapsibleContent`, `SlidersHorizontal` icon
2. Build an active-filter count (number of filters not set to 'all') to show on the trigger badge
3. On mobile (`sm:` breakpoint and below):
   - Render a `Collapsible` wrapper
   - Trigger button: a sleek pill/chip with `SlidersHorizontal` icon + "Filters" label + active count badge + chevron
   - Content: the existing three `FilterRow` components inside `CollapsibleContent` with slide animation
4. On desktop (`sm:` and up): render the existing layout unchanged (always visible)

**Trigger button style**: rounded-xl, bg-background border, flex items-center, with a small colored badge showing active filter count (e.g. "2") when filters are applied — modern and minimal.

No changes needed in `Generate.tsx`.

