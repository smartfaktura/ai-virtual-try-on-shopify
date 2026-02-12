
## Replace Bottom Tab Bar with Top Header Bar on Mobile

Remove the bottom tab bar and add a clean, minimal top header for mobile — Apple-style with a logo on the left and a hamburger icon on the right that opens the existing slide-out sidebar.

### What Changes

**1. Remove `MobileTabBar` component**
- Delete `src/components/app/MobileTabBar.tsx` (no longer needed)

**2. Update `src/components/app/AppShell.tsx`**
- Remove the `MobileTabBar` import and usage
- Add a mobile-only top header bar (`lg:hidden`) with:
  - Logo ("V" icon + "VOVV.AI" text) on the left — taps navigate to `/app`
  - Hamburger menu icon on the right — taps open the existing sidebar overlay
  - Frosted glass aesthetic: `backdrop-blur-xl bg-background/80 border-b border-white/[0.06]`
  - Fixed height (`h-14`), sticky at top
- Revert main content bottom padding from `pb-20 lg:pb-8` back to just `pb-8` (no bottom tab bar to account for)
- Add top padding on mobile for the header: `pt-14 lg:pt-0` on the main content wrapper

**3. Update `src/pages/Freestyle.tsx`**
- Revert the prompt bar positioning from `bottom-16 lg:bottom-0` back to `bottom-0` on all breakpoints (no bottom tab bar to dodge)

### Visual Result (Mobile)

```text
+----------------------------------+
| [V] VOVV.AI              [=]    |  <-- frosted glass header
+----------------------------------+
|                                  |
|         Page Content             |
|         (scrollable)             |
|                                  |
+----------------------------------+
```

Tapping the hamburger opens the full sidebar overlay (already implemented) with access to all navigation items, settings, user profile, and sign out.

### Technical Details

- The header uses `sticky top-0 z-30` so it stays visible while content scrolls underneath
- `backdrop-blur-xl` + semi-transparent background gives the Apple frosted-glass effect
- No new dependencies or components needed — just restructuring existing code
- Desktop sidebar remains completely unchanged
