

## Fix Discover Performance, Full-Screen Modal, Better Similarity, Saved Count

### 1. Fix Gallery Lag / Glitching on Load

**Problem**: All images render at once, causing layout shift and jank as they load at different speeds in the masonry grid.

**Solution in `src/pages/Discover.tsx` and `src/components/app/DiscoverCard.tsx`:**
- Add progressive loading: show a placeholder shimmer while images load, then fade them in with a CSS transition
- In `DiscoverCard.tsx`, add an `onLoad` state that starts as `false`, set to `true` on `<img onLoad>`. Image starts with `opacity-0` and transitions to `opacity-100` once loaded
- Add a shimmer placeholder `div` behind the image that shows until loaded
- This prevents layout jumps and creates a smooth "develop" effect as images load in

### 2. Full-Screen Split-Layout Detail Modal

**Problem**: Current modal is a small centered dialog with cramped vertical scrolling. Image is small, buttons are buried.

**Solution -- replace Dialog with a full-screen overlay in `src/components/app/DiscoverDetailModal.tsx`:**

Instead of the Radix Dialog centered card, render a full-screen overlay with a split layout:

```text
+--------------------------------------------------+
|  [X close]                                        |
|                                                   |
|   +---------------------+  +-------------------+  |
|   |                     |  |  LIFESTYLE - Scene |  |
|   |                     |  |  Garden Natural    |  |
|   |     BIG IMAGE       |  |                   |  |
|   |     (fills left)    |  |  [Generate Prompt] |  |
|   |                     |  |  [prompt result]   |  |
|   |                     |  |  [Copy] [Use FF]   |  |
|   |                     |  |                   |  |
|   |                     |  |  Description...    |  |
|   |                     |  |  #tags             |  |
|   |                     |  |                   |  |
|   |                     |  |  [== Use Scene ==] |  |
|   |                     |  |  [Save] [Similar]  |  |
|   |                     |  |                   |  |
|   |                     |  |  More like this    |  |
|   |                     |  |  [t] [t] [t]       |  |
|   +---------------------+  +-------------------+  |
+--------------------------------------------------+
```

- Full viewport overlay (`fixed inset-0 z-50 bg-black/90`)
- Two-column layout: left is the image (60% width, centered, `object-contain`, fills the height), right is a scrollable panel (40% width) with all controls
- Right panel has frosted glass background (`bg-background/95 backdrop-blur-xl`)
- Close button (X) in top-right corner of the overlay
- Image gets maximum showcase space
- On mobile (<768px), stack vertically: image on top, controls below, full-screen scroll
- Animate in with `animate-in fade-in` for smooth open

### 3. Improve "More Like This" Similarity

**Current issue**: Scoring only uses category and tags. Scenes have no tags, so they only match by category -- weak matches.

**Improvements in `src/pages/Discover.tsx`:**
- Add description keyword matching: extract significant words from item descriptions and score overlaps (+1 per shared keyword)
- For scenes matching scenes: boost score by +3 (scenes are rare, showing other scenes is valuable)
- Increase result count from 6 to 9 (3x3 grid in the right panel)
- Filter out items with score 0 (truly unrelated)

### 4. Show Saved Count on "Saved" Category Pill

**Change in `src/pages/Discover.tsx`:**
- The "Saved" category pill already exists. Add a count badge next to it showing `savedItems.length`
- Display as: `Saved (3)` or with a small numeric badge
- Only show the count when `savedItems.length > 0`
- Style the count as a subtle inline number: `Saved` becomes `Saved · 3` with the number in a slightly different opacity

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/app/DiscoverCard.tsx` | Add shimmer placeholder + fade-in on image load |
| `src/components/app/DiscoverDetailModal.tsx` | Full rewrite: full-screen overlay with split layout (image left, controls right), mobile responsive stacking |
| `src/pages/Discover.tsx` | Add saved count to "Saved" pill, improve similarity scoring with description keywords, increase related to 9 |

No new files. No database changes.

### Technical Details

**DiscoverCard.tsx -- Progressive Loading:**
- Add `const [loaded, setLoaded] = useState(false)` state
- Image gets `className={cn("... transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}` and `onLoad={() => setLoaded(true)}`
- Behind the image, add a `div` with `animate-pulse bg-muted` that shows when `!loaded`

**DiscoverDetailModal.tsx -- Full-Screen Split:**
- Remove `Dialog`/`DialogContent` wrapper entirely
- Replace with a custom `fixed inset-0 z-50` overlay
- Use conditional rendering based on `open` prop
- Left panel: `w-full md:w-[60%] h-full flex items-center justify-center bg-black/95`
- Right panel: `w-full md:w-[40%] h-full overflow-y-auto bg-background/95 backdrop-blur-xl p-8`
- Close button: `absolute top-6 right-6 z-10` with frosted glass background
- Mobile: `flex-col` instead of `flex-row`, image gets `max-h-[45vh]`
- Add `useEffect` to lock body scroll when open, restore on close

**Similarity Scoring Enhancement:**
- Add a helper that extracts keywords from descriptions (split by space, filter out common words like "and", "the", "with", "in", words under 3 chars)
- Score +0.5 per shared keyword between items
- Scene-to-scene bonus: +3
- This makes "Garden Natural" match other outdoor/garden-themed items even across types

**Saved Count Badge:**
- In the CATEGORIES map render, for `cat.id === 'saved'`, append ` · ${savedItems.length}` when count > 0
- Subtle styling: the number uses `text-muted-foreground/60` when not active
