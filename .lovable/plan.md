

## Goal
Restyle the sidebar **"Create Visuals"** CTA in `AppShell.tsx` to match the **"Upgrade"** button look from `CreditIndicator` — solid white pill, dark text, subtle shadow, shimmer overlay.

## Change
In `src/components/app/AppShell.tsx` (lines 206-216), replace the button's classes:

- `bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25`
  →
- `bg-white text-[hsl(var(--sidebar-background))] hover:brightness-105 shadow-[0_2px_8px_-2px_hsl(0_0%_0%/0.4)]`
- Add `relative overflow-hidden` to host the shimmer
- Wrap icon + label in a `<span className="relative">` so they sit above the shimmer
- Add the same shimmer span used in `CreditIndicator`:
  ```
  <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)] bg-[length:200%_100%] animate-shimmer mix-blend-overlay pointer-events-none" />
  ```

Keeps: full-width, h-10, rounded-full, gap, collapsed/expanded behavior, Sparkles icon, click handler, title tooltip.

## Files touched
- `src/components/app/AppShell.tsx` (one button only)

## Out of scope
Other sidebar items, Upgrade button, layout, spacing.

