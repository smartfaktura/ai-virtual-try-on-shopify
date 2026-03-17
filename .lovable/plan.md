

## Fix Mobile Menu Lag and Close-on-Background Issues

### Problems
1. **Lag**: `backdrop-blur-xl` on the mobile dropdown (line 88) is expensive — it blurs the entire hero section behind it on every frame during the `max-height` transition, causing jank on mobile devices.
2. **Closes when clicking content behind it**: The menu panel has no backdrop overlay, so tapping the visible area outside the menu hits the landing page content underneath. The user wants the menu to only close via the X button.

### Fixes in `src/components/landing/LandingNav.tsx`

**1. Remove backdrop-blur from mobile dropdown to eliminate lag:**
- Change `backdrop-blur-xl` → remove it, use fully opaque `bg-sidebar` instead of `bg-sidebar/95`
- This eliminates the GPU-heavy blur compositing during the `max-height` animation

**2. Add an invisible backdrop overlay that blocks clicks but doesn't close the menu:**
- When `mobileOpen` is true, render a `fixed inset-0` transparent div behind the menu that absorbs clicks (prevents interacting with page content)
- This overlay does NOT close the menu — only the X button does

**3. Remove the toggle behavior from the hamburger/X button click handler:**
- Currently the X button calls `setMobileOpen(!mobileOpen)` which is fine, but also ensure `handleNavClick` still closes on navigation (that's expected behavior)

### Code

```tsx
{/* Backdrop — blocks page interaction when menu is open, does NOT close menu */}
{mobileOpen && (
  <div className="fixed inset-0 z-[-1] lg:hidden" />
)}

{/* Mobile menu — no backdrop-blur, fully opaque */}
<div
  className={`lg:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out will-change-[max-height] mt-1 rounded-2xl bg-sidebar ${
    mobileOpen ? 'max-h-80 border border-white/[0.06] shadow-2xl shadow-black/20' : 'max-h-0'
  }`}
>
  ...
</div>
```

### File
- `src/components/landing/LandingNav.tsx`

