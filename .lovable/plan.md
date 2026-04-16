

# Improve Arrow Styling & Remove Counter

## What's Changing

1. **LibraryDetailModal arrows** (used in both `/app/freestyle` and `/app/library`): Upgrade arrow styling to match the polished `ImageLightbox` design — semi-transparent white/dark circles with blur, slightly larger, smooth hover transitions.

2. **Remove the "2/3" counter badge** from the bottom of the image area in `LibraryDetailModal`.

## Technical Changes

### `src/components/app/LibraryDetailModal.tsx` — Lines 166-184

**Arrows (lines 169-180)**: Replace the current `bg-background/60 backdrop-blur border border-border/30` styling with a more refined glass-morphism style matching `ImageLightbox`:
- `w-11 h-11` (slightly larger)
- `bg-black/20 dark:bg-white/15 backdrop-blur-md border border-white/10`
- `hover:bg-black/30 dark:hover:bg-white/25`
- Always visible on mobile, fade on hover on desktop (keep existing `md:opacity-0 md:group-hover/img:opacity-100`)
- Icon size bumped to `w-5 h-5`

**Counter (lines 181-183)**: Delete the `2/3` counter `<div>` entirely.

| File | Change |
|------|--------|
| `src/components/app/LibraryDetailModal.tsx` | Restyle nav arrows, remove counter badge |

