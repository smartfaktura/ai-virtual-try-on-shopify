
## Fix: Glitchy Mobile Scrolling in Creative Drop Wizard

### Root Cause

Two issues are causing the "stuck" scrolling on mobile:

1. **`h-screen` (100vh) on iOS is wrong.** On mobile Safari, `100vh` includes the hidden address bar area, making the layout taller than the actual visible viewport. This means the scroll container's height calculation is off, and the bottom content gets clipped behind the browser chrome. The fix is to use `h-dvh` (dynamic viewport height), which adapts to the actual visible area as the address bar shows/hides.

2. **Scroll chaining (bounce conflict).** The `main` element has `overflow-y-auto`, creating a nested scroll context inside the page. On iOS, when you reach the top or bottom of this inner scroll container, the browser tries to "chain" the scroll to the outer document body, causing the rubber-band bounce effect to fight with the inner scroll. This creates the glitchy, stuck feeling where it takes multiple swipes to actually scroll. Adding `overscroll-behavior-y: contain` prevents this chaining.

### Technical Changes

**File: `src/components/app/AppShell.tsx`**

**1. Replace `h-screen` with `h-dvh` (line 240)**

```
// Before
<div className="flex h-screen bg-background">

// After
<div className="flex h-dvh bg-background">
```

`h-dvh` uses `100dvh` which correctly accounts for iOS Safari's dynamic address bar. Tailwind v3.4+ supports this utility natively.

**2. Add `overscroll-behavior-y-contain` to the main scroll container (line 286)**

```
// Before
<main className="flex-1 overflow-y-auto">

// After
<main className="flex-1 overflow-y-auto overscroll-contain">
```

This tells the browser: "when scroll reaches the boundary of this element, do NOT chain the scroll to the parent." This eliminates the rubber-band bounce conflict that makes scrolling feel stuck.

### Summary
- 1 file modified: `src/components/app/AppShell.tsx`
- 2 small class changes, no new dependencies
- Fixes the glitchy scroll-to-top and scroll-to-bottom behavior on all iOS mobile views, not just the wizard
