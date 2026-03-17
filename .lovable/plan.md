

## Improve Product Switcher Visibility (Mobile + Desktop)

### Problem
The "Crop Top", "Ring", "Headphones" pills are too small and don't look clickable — especially on mobile where they're `text-[10px]` with minimal padding. Users don't realize they can interact with them.

### Changes in `src/components/landing/HeroSection.tsx`

**Mobile switcher (lines 372-385):**
- Increase size: `text-[10px] px-2 py-0.5` → `text-xs px-3 py-1.5`
- Make inactive pills more prominent: add `hover:border-primary/40` and a subtle arrow or tap hint
- Add a small label above pills: `"Switch product"` in `text-[10px] text-muted-foreground` so users know it's interactive
- Add `onMouseEnter` preload like desktop already has

**Desktop switcher (lines 424-441):**
- Increase size slightly: `px-4 py-1.5` → `px-5 py-2 text-sm`
- Add a small label above: `"Try different products"` in `text-xs text-muted-foreground`
- Keep existing hover/scale effects but make inactive border slightly more visible (`border-border/80`)

### Result
Pills become clearly tappable buttons with better sizing and a contextual label that signals interactivity.

