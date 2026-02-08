

# Fix Generating Card Size + Smooth Image Fade-In

## Problems

1. **Size mismatch**: The generating card is a small square while neighboring images are tall portraits. The flex container uses `items-start`, so the card doesn't stretch to match sibling heights.
2. **Abrupt image appearance**: Images pop in instantly with a quick 0.2s fade. When they replace the generating card, the transition feels jarring/"laggy".

## Solution

### 1. Match generating card height to images (FreestyleGallery.tsx)

**Centered layout (count <= 3):**
- Change flex container from `items-start` to `items-stretch` so all children (generating cards and images) share the same height
- The image cards already constrain themselves with `max-h-[calc(100vh-400px)]` -- the generating card will now stretch to match
- Remove the wrapper `div` around generating cards that was forcing `aspect-square` -- let flexbox handle sizing
- Give the generating card a `min-w-[280px]` so it has reasonable width when stretching vertically

**Grid layout (count > 3):**
- The grid cells already have equal width; just ensure the generating card fills the cell properly with `w-full h-full`

### 2. Smooth image fade-in (FreestyleGallery.tsx)

Add an `onLoad`-driven fade for `ImageCard`:
- Start each image with `opacity-0`
- On the `<img>` `onLoad` event, set a state flag to `true`
- Transition to `opacity-100` with a `duration-500 ease-out` CSS transition
- This creates a smooth "developing" effect where images gracefully materialize instead of popping in

### 3. Update fade-in animation (index.css)

- Increase the `fadeIn` keyframe duration from `0.2s` to `0.5s` and add a slight scale-up (`from: scale(0.98)`) for a more polished entrance

---

## Technical Details

### File: `src/components/app/freestyle/FreestyleGallery.tsx`

**ImageCard changes:**
- Add `useState(false)` for `loaded` state
- Add `onLoad={() => setLoaded(true)}` to the `<img>` element
- Apply `opacity-0 transition-opacity duration-700 ease-out` by default, then `opacity-100` when loaded
- Remove the `animate-fade-in` class from the card wrapper (replace with the load-driven transition)

**GeneratingCard changes:**
- Accept full height/width from parent via `w-full h-full` in className
- Keep `min-h-[300px]` as a floor so it doesn't collapse when there are no images

**Centered layout (lines 209-228):**
- Change `items-start` to `items-stretch` on the flex container
- Remove wrapper div around generating cards; render them directly with proper sizing
- Image cards in natural mode: wrap in a container that constrains max-height but allows flex stretch

**Grid layout (lines 231-245):**
- No structural changes needed; the generating card already fills grid cells

### File: `src/index.css`

- Update `fadeIn` to `0.5s` duration and add `transform: scale(0.98)` on the `from` state

### Files changed

1. `src/components/app/freestyle/FreestyleGallery.tsx` -- Fix card sizing, add image load transition
2. `src/index.css` -- Slow down fadeIn animation

