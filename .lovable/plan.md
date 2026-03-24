

# Improve Presets Header & Equalize Hint Banner Spacing

## Changes

### 1. `src/components/app/freestyle/FreestyleQuickPresets.tsx` — Better header text & sizing

Replace the current small header with a more visible, branded layout:

**Current:**
- `text-xs font-semibold` for "Amara picked these for you"
- `text-[10px]` for "Tap a scene to get started"

**New:**
- Avatar: `w-7 h-7` (slightly larger)
- Main line: `text-sm font-semibold` — "Amara picked these for you"
- Subtitle: `text-xs text-muted-foreground` — "You're in Freestyle — start with a scene or describe what you want to create"
- Add `mb-4` (was `mb-3`) between header and carousel for breathing room
- Center-aligned on all breakpoints

### 2. `src/pages/Freestyle.tsx` (~line 990-1011) — Equalize spacing around hint banner

The hint banner ("Your scene is set — Add your product") currently uses `my-4` which creates unequal visual spacing relative to the scene cards above and the prompt bar below.

Change the hint banner wrapper from `my-4` to `my-6` to create equal breathing room:
- **Above** hint banner (from scene cards): `my-6` top = ~24px
- **Below** hint banner (to prompt bar): `my-6` bottom = ~24px

Also increase the empty state bottom padding from `pb-10 lg:pb-16` to `pb-14 lg:pb-20` so that when no hint banner is shown, the scene cards still have generous spacing from the prompt bar — matching the visual distance the hint banner creates when present.

### Files
- `src/components/app/freestyle/FreestyleQuickPresets.tsx` — larger avatar, better text sizing, descriptive subtitle
- `src/pages/Freestyle.tsx` — equalized spacing around hint banner, more bottom padding on empty state

