
## Apply Floating Header Style to Landing Page Navigation

Make the landing page (`/`) mobile header match the floating card style already used in the `/app` shell, creating a consistent design language across the entire site.

### Current State
- `/app` mobile header: floating card with `m-3 rounded-2xl border border-white/[0.06] bg-sidebar shadow-2xl` -- looks great
- `/` landing page header: standard full-width sticky bar with no floating effect -- feels inconsistent

### Changes

**File: `src/components/landing/LandingNav.tsx`**

1. **Wrap the header in a floating container on mobile**:
   - Add outer padding (`p-3`) on mobile so the nav bar floats away from edges
   - Apply `rounded-2xl border border-white/[0.06] shadow-2xl shadow-black/20` to the inner bar on mobile
   - Keep the frosted glass `backdrop-blur-xl` effect
   - On desktop (`lg:`), maintain the current full-width style unchanged

2. **Update the mobile dropdown menu** to sit inside the floating container:
   - The dropdown should appear below the floating bar, also with rounded corners
   - Maintain the smooth `max-height` animation already in place

3. **Structural approach**:
   - The outer `<header>` becomes a fixed container with `p-3` padding on mobile
   - The inner nav bar gets the floating card classes on mobile via responsive utilities
   - On `lg:` screens, padding reverts to 0 and the bar spans full width as before

### Visual Result (Mobile)

```text
   +------------------------------+
   |  [V] VOVV.AI          [=]   |  <-- floating, rounded, matches /app
   +------------------------------+
   |                              |
   |       Landing Content        |
   |                              |
```

### Technical Details

- Single file change: `src/components/landing/LandingNav.tsx`
- Use responsive classes: `p-3 lg:p-0` on the outer wrapper, `rounded-2xl lg:rounded-none` on the inner bar
- Add `border border-white/[0.06] lg:border-0` and `shadow-2xl shadow-black/20 lg:shadow-none` for the floating effect on mobile only
- Background changes to `bg-sidebar lg:bg-transparent` when not scrolled, and `bg-sidebar lg:bg-background/80` when scrolled
- Mobile dropdown gets matching rounded bottom corners within the floating container
