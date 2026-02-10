

## Fix Full-Screen Modal Layout, Black X, Better View Count

### Issues from Screenshot
- Top-left corner shows the app sidebar bleeding through (dark area with "VOVV.AI")
- Image not properly centered, cut off at bottom with no padding
- X button is on the light panel but styled for dark background -- needs to be black
- View count (eye icon + number) is tiny and awkwardly placed in the top-right corner

### Changes to `src/components/app/DiscoverDetailModal.tsx`

**1. True full-screen coverage:**
- The backdrop `div` already has `fixed inset-0` but the sidebar has a high z-index. Increase the outer wrapper z-index to `z-[200]` to guarantee it sits above everything including the sidebar
- Ensure the backdrop covers the entire viewport with no gaps

**2. Image centering and spacing:**
- Add proper padding to image container: `p-6 md:p-12` so the image never touches the edges
- The image should use `max-h-[calc(100vh-6rem)]` on desktop and `max-h-[calc(45vh-2rem)]` on mobile to keep breathing room at top and bottom

**3. X button -- black, on the right panel:**
- Move the X button inside the right panel (not floating over the image area)
- Style it as `text-foreground/70 hover:text-foreground` (black in light mode) with no circle background
- Position it `absolute top-5 right-5` within the right panel container (which needs `relative`)
- Make it `w-7 h-7` with `strokeWidth={2}`

**4. View count -- better placement and size:**
- Move view count below the title as its own line, not squeezed into the category row
- Use a slightly larger eye icon (`w-4 h-4`) with the count in `text-xs` font
- Format as: `[Eye icon] 142 views` in `text-muted-foreground/60`
- Give it its own row with slight top margin for visual breathing room

### Updated layout structure:

```text
Right panel (relative):
  [X button - top right, black]
  
  EDITORIAL · SCENE  (category label)
  Editorial Artistic  (title, large)
  [Eye] 12 views  (dedicated line, muted)
  
  [Generate Prompt from Image]
  [generated prompt if available]
  
  DESCRIPTION
  High-fashion pose with...
  
  [=== Use Scene ===]
  
  [Save] [Similar] [Copy]
  
  --- More like this ---
  [thumbnails]
```

### File to modify
| File | Changes |
|------|---------|
| `src/components/app/DiscoverDetailModal.tsx` | Increase z-index to z-[200], fix image padding/centering, move X into right panel as black icon, relocate view count below title with bigger icon |

