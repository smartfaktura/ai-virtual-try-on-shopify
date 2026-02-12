

## Match Landing Nav to App Sidebar Colors

The floating nav currently uses `bg-primary` (brand blue). The user wants it to match the dark navy sidebar from `/app`, which uses `--sidebar-background: 222 47% 11%`.

### What Changes

**File: `src/components/landing/LandingNav.tsx`**

Switch the nav bar from primary colors to sidebar colors to match the `/app` navigation:

1. **Nav background**: Change `bg-primary/95` and `bg-primary/90` to `bg-sidebar/95` and `bg-sidebar/90`
2. **Border**: Change `border-primary/10` to `border-white/[0.06]` (matching the sidebar subtle border)
3. **Logo box**: Change `bg-primary-foreground` to `bg-sidebar-accent` (the gray highlight seen on sidebar items) with `text-sidebar-foreground` text
4. **Logo text**: Change `text-primary-foreground` to `text-sidebar-foreground`
5. **Nav links**: Change `text-primary-foreground/80` to `text-sidebar-foreground/80` with hover `text-sidebar-foreground`
6. **CTA button**: Change to `bg-primary text-primary-foreground` (the brand-colored button stands out against the dark nav)
7. **Mobile toggle**: Change `text-primary-foreground` to `text-sidebar-foreground`

### Technical Details

Single file change: `src/components/landing/LandingNav.tsx`. All modifications are CSS class swaps -- no logic changes. The mobile dropdown already uses `bg-sidebar/95` so it will remain consistent.
