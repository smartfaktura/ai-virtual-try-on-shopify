

## Freestyle Gallery Layout Improvements

The current layout has several visual problems: a single image sits awkwardly small in the top-left corner of the masonry grid, there's vast empty white space, no visual context to make images pop, and the prompt bar feels flat. Here's the plan to fix all of it.

---

### 1. Adaptive Layout Based on Image Count

The masonry `columns-2 lg:columns-3` layout works great for 10+ images but looks terrible with 1-3 images (tiny image in a corner with empty columns). The fix is to adapt the layout:

- **1 image**: Display it centered and large (max-width ~500px), with a subtle rounded corner and shadow, like showcasing a single creation
- **2 images**: Side-by-side centered row, each image takes natural proportions
- **3 images**: Centered row or 2+1 layout
- **4+ images**: Current masonry columns layout kicks in

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**
- Add conditional layout logic based on `images.length`
- For 1-3 images: use a flex/grid centered layout with larger image sizes
- For 4+: keep the current `columns-2 lg:columns-3` masonry

---

### 2. Dark Gallery Background

White background makes the images look washed out and the empty space feels sterile. A subtle neutral/dark background behind the gallery area creates a professional photo-studio feel and makes images pop.

**File: `src/pages/Freestyle.tsx`**
- Add `bg-neutral-950` (or `bg-zinc-950`) to the main gallery container
- This gives a dark canvas behind the images, similar to Lightroom or professional galleries
- The floating prompt bar keeps its current light translucent style, creating a nice contrast

---

### 3. Image Cards with Polish

Currently images are raw rectangles with a 2px gap and no rounding. Adding subtle styling makes each image feel like a finished piece:

**File: `src/components/app/freestyle/FreestyleGallery.tsx`**
- Add `rounded-lg` to each image card (small, ~8px radius)
- Increase gap from `2px` to `4-6px` so rounding is visible
- Add a very subtle shadow on each card
- Show the prompt text as a small caption on hover (below the delete/download icons), fading in with the overlay

---

### 4. Stronger Floating Prompt Bar

The prompt bar needs more visual presence to feel like it's floating above content:

**File: `src/pages/Freestyle.tsx`**
- Add a gradient fade zone above the prompt bar: a 40px tall gradient from transparent to the dark background color, so images smoothly fade into the bar area
- Increase the prompt bar's shadow to `shadow-2xl` for more dramatic depth
- Keep the `backdrop-blur-xl` for the frosted glass effect

---

### 5. Empty State Polish

When there are zero images, the empty state should also use the dark background for consistency, with the centered prompt panel having inverted styling.

**File: `src/pages/Freestyle.tsx`**
- Dark background for empty state too
- Light text colors for the "Freestyle Studio" heading and description
- Prompt panel remains the same light card style (contrasts nicely against dark bg)

---

### Visual Result

```text
Few images (1-3):
+-----------------------------------------------------------+
|          |                                                 |
| Sidebar  |       ████████████████████████                  |
|          |       ███ (centered, large) ███                 |
|          |       ████████████████████████                  |
|          |       dark bg everywhere else                   |
|          |                                                 |
|          |  ~~~ gradient fade ~~~                           |
|          |  +-------------------------------------------+  |
|          |  |  Describe what you want...       FLOATING |  |
|          |  +-------------------------------------------+  |
+-----------------------------------------------------------+

Many images (4+):
+-----------------------------------------------------------+
|          | ████ ████ ████  <- edge-to-edge masonry         |
| Sidebar  | ████████ ████   <- natural aspect ratios        |
|          | ████ ████████   <- rounded corners, 4px gap     |
|          | ████ ████ ████  <- dark bg behind images         |
|          |                                                 |
|          |  ~~~ gradient fade ~~~                           |
|          |  +-------------------------------------------+  |
|          |  |  Describe what you want...       FLOATING |  |
|          |  +-------------------------------------------+  |
+-----------------------------------------------------------+
```

---

### Technical Details -- Files Changed

| File | Change |
|------|--------|
| `src/pages/Freestyle.tsx` | Dark background (`bg-neutral-950`); gradient fade zone above prompt bar; light text for empty state; stronger prompt bar shadow |
| `src/components/app/freestyle/FreestyleGallery.tsx` | Adaptive layout (centered for 1-3 images, masonry for 4+); `rounded-lg` on image cards; increased gap to 4px; prompt caption on hover; light text styling for dark bg context |

No database, storage, or backend changes needed. Two files only.
