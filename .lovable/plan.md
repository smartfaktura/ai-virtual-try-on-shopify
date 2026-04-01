

# Add Video Showcase Section to Video Hub

## What
Add a showcase section below the workflow cards on `/app/video` displaying the 10 uploaded MP4 files in a grid of uniform 4:3 ratio cards, all autoplaying (muted, looped).

## Steps

### 1. Copy video files to `public/videos/showcase/`
Copy all 10 uploaded MP4s to `public/videos/showcase/` with shorter filenames (e.g., `showcase-1.mp4` through `showcase-10.mp4`).

### 2. Add Showcase section in `src/pages/VideoHub.tsx`
Insert a new section between the workflow cards grid and the "In Progress" section (~after line 220):

- **Title**: "Showcase" with a subtitle like "See what's possible"
- **Grid**: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3` (2 rows of 5 on desktop)
- Each card: a `<video>` element with `autoPlay muted loop playsInline` inside a `rounded-xl overflow-hidden` wrapper with fixed `aspect-[4/3]`
- Videos referenced as `/videos/showcase/showcase-1.mp4` etc.
- Simple array of filenames, mapped to cards

### Layout
```text
Showcase
See what's possible

┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ 4:3 │ │ 4:3 │ │ 4:3 │ │ 4:3 │ │ 4:3 │
└─────┘ └─────┘ └─────┘ └─────┘ └─────┘
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ 4:3 │ │ 4:3 │ │ 4:3 │ │ 4:3 │ │ 4:3 │
└─────┘ └─────┘ └─────┘ └─────┘ └─────┘
```

## Files
| File | Change |
|------|--------|
| `public/videos/showcase/` | 10 MP4 files copied from uploads |
| `src/pages/VideoHub.tsx` | Add Showcase grid section with autoplay videos |

