

# Add More Visible Mobile "Recreate" Button on Dashboard Discover Cards

## Problem
The mobile "Recreate" button on Steal This Look cards exists in code but may be hard to see — it's small, semi-transparent white, and can blend with light images. The user wants it clearly visible in the corner.

## Changes

### 1. `src/components/app/DiscoverCard.tsx` — Make mobile recreate button more prominent
- Change from `bg-white/90` pill at bottom-right to a more visible dark-themed button
- Use `bg-black/80 text-white` with a subtle backdrop blur for contrast against any image
- Make the button slightly larger and add an icon-only compact variant for mobile
- Position: bottom-right corner with proper padding

**Before:**
```tsx
<button className="absolute bottom-2 right-2 z-10 [@media(hover:hover)]:hidden flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-black text-xs font-semibold shadow-md">
  Recreate <ArrowRight />
</button>
```

**After:**
```tsx
<button className="absolute bottom-2 right-2 z-10 [@media(hover:hover)]:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/80 backdrop-blur-sm text-white text-xs font-semibold shadow-lg border border-white/10">
  Recreate <ArrowRight />
</button>
```

### Files
- `src/components/app/DiscoverCard.tsx`

