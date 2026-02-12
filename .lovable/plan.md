

## Make Landing Nav Floating on Desktop

Currently the nav is only floating (rounded, shadowed, with margin) on mobile. On desktop (`lg:` breakpoint), it stretches full-width with no rounding, no shadow, and no padding -- a standard flat top bar.

### What Changes

**File: `src/components/landing/LandingNav.tsx`**

Remove the `lg:` overrides that flatten the nav on desktop, so the floating pill-shaped style applies at all breakpoints:

1. **Header wrapper** (`<header>`): Change `p-3 lg:p-0` to `p-3` so the outer padding is consistent
2. **Nav bar** (`<nav>`): Remove these desktop overrides:
   - `lg:rounded-none` -- keep `rounded-2xl` at all sizes
   - `lg:border-0` -- keep the subtle `border-white/[0.06]` border
   - `lg:shadow-none` -- keep the `shadow-2xl shadow-black/20` elevation
   - `lg:bg-background/80` / `lg:bg-transparent` -- use the `bg-sidebar` / frosted glass look consistently
   - `lg:border-b lg:border-border lg:shadow-sm` on scroll -- replace with the existing mobile scroll style
3. **Max width**: Keep `lg:max-w-7xl lg:mx-auto` so the floating bar is centered and doesn't stretch edge-to-edge on ultrawide monitors
4. **Logo text color**: Change `lg:text-foreground` to use `text-sidebar-foreground` consistently

The result: a centered, rounded, frosted-glass pill nav that floats over the hero content on all screen sizes -- matching the current mobile aesthetic but scaled up for desktop.

### Technical Details

Only one file changes: `src/components/landing/LandingNav.tsx`. The modifications are purely CSS class adjustments on the `<header>` and `<nav>` elements (lines 33-39 and line 46). No logic, props, or structure changes needed.
