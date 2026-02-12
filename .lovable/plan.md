

## Improve Landing Page Mobile Menu

### Problems
- Menu appears/disappears abruptly with no animation (feels laggy)
- "Monthly Creative Drops" clutters the mobile menu unnecessarily
- Breakpoint at `md:` (768px) causes cramped layout on tablets
- Overall feel isn't polished or Apple-like

### Changes

**File: `src/components/landing/LandingNav.tsx`**

1. **Remove "Monthly Creative Drops" from mobile menu** -- it's only relevant on desktop as a marketing badge, not as navigation

2. **Change all breakpoints from `md:` to `lg:`** -- keeps hamburger active on tablets where there isn't enough space

3. **Add smooth slide-down animation** to the mobile menu using CSS transitions instead of conditional rendering:
   - Use `max-height` + `opacity` transition for a smooth open/close
   - Or use a wrapper with `overflow-hidden` and `transition-all` with dynamic height
   - This eliminates the jarring pop-in/pop-out

4. **Improve mobile menu styling**:
   - Slightly larger touch targets (py-3 instead of py-2)
   - Subtle separator lines between items
   - Refined spacing and typography
   - Full-width CTA button with more presence

### Technical Details

All changes are in one file: `src/components/landing/LandingNav.tsx`

Key class changes:
- `hidden md:flex` becomes `hidden lg:flex` (desktop links)
- `hidden md:block` becomes `hidden lg:block` (desktop CTA)
- `md:hidden` becomes `lg:hidden` (mobile toggle + menu)
- Mobile menu gets `transition-all duration-300 ease-in-out` with `max-height` and `opacity` for smooth animation
- Remove the "Monthly Creative Drops" button from the mobile menu section (lines 100-106)
- Increase button padding from `py-2` to `py-3` for better touch targets
- Add `divide-y divide-border/50` for subtle separators between links

