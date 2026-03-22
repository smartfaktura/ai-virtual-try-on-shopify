

# Remove Left Fade, Bigger Subtitle, Remove CTA Link

## Changes

### 1. `src/index.css` (line 549-551)
Update `.fade-scroll` to only fade on the right edge (remove left fade):
```css
.fade-scroll {
  mask-image: linear-gradient(to right, black, black calc(100% - 32px), transparent);
  -webkit-mask-image: linear-gradient(to right, black, black calc(100% - 32px), transparent);
}
```

### 2. `src/pages/PublicDiscover.tsx` (lines 333-341)
- Make subtitle text bigger: change `text-base` to `text-lg` and widen `max-w-lg` to `max-w-xl`
- Delete the "Start generating for free →" link entirely (lines 336-341)

### 3. `src/pages/Discover.tsx`
Check if same CTA link exists there — if so, remove it too.

### Summary
3 small edits across 2-3 files. No structural changes.

