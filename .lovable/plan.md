

# Move "Earn Credits" to Main Nav + Rebrand to Primary Color

## Changes

### File: `src/components/app/AppShell.tsx`

1. **Move "Earn Credits" into the `navItems` array** — add it as the last item after Library:
   ```ts
   { label: 'Earn Credits', icon: Gift, path: '#earn-credits', isModal: true }
   ```

2. **Update `NavItemButton`** to handle modal items — when `item.isModal` is true, open the `earnCreditsOpen` state instead of navigating.

3. **Remove the standalone "Earn Credits" button block** (lines 188-201) that currently sits between nav and credits.

4. **Style** — uses the same `text-sidebar-foreground/50 hover:text-white/75` as all other nav items. No amber, no special color — it's just a regular nav item with the Gift icon. Blends in with the brand.

### File: `src/components/app/EarnCreditsModal.tsx`

5. **Replace amber/gold colors with primary brand color** throughout:
   - Hero gradient: `from-primary/20 via-primary/10` instead of `from-amber-500/20`
   - Step number badges: `bg-primary/10 text-primary` instead of amber
   - CTA button: `bg-primary hover:bg-primary/90 text-primary-foreground` instead of amber

## Summary
- 2 files changed, ~15 lines
- Earn Credits becomes a standard nav item after Library
- All amber replaced with brand primary color
- No sidebar clutter — same style as every other menu item

