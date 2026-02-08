

## Hover-to-Preview Animated Thumbnails

### The Problem
All 10 workflow cards animate simultaneously, creating visual overload and making it hard to focus on any single workflow.

### The Solution
Show a **static first-frame image** by default. When the user **hovers** over a card, the animation starts playing. When they leave, it resets back to the static image. This is the same pattern used by Botika and Netflix-style thumbnails.

### How It Will Work

```text
+-------------------+      +-------------------+
|                   |      |  [Upload Product]  |
|   Static Image    | ---> |    (animating...)   |
|  (first frame)    | hover|  Step 1 → 2 → 3 → 4|
|                   |      |  [progress dots]   |
+-------------------+      +-------------------+
     At Rest                   On Hover
```

### Changes

**1. Update `WorkflowAnimatedThumbnail.tsx`**
- Add `isActive` prop (boolean) that controls whether the animation is running
- When `isActive = false`: show only the first step's image (static), hide labels/dots/overlays
- When `isActive = true`: run the step-cycling animation as it does now
- On transition from active to inactive: reset `activeStep` back to 0 smoothly

**2. Update `WorkflowCard.tsx`**
- Add `useState` to track hover state (`isHovered`)
- Attach `onMouseEnter` / `onMouseLeave` to the card's image container
- Pass `isActive={isHovered}` to `WorkflowAnimatedThumbnail`
- Keep the subtle `group-hover:scale-105` zoom on the static image for a polished resting state

### Behavior Details
- **At rest**: Clean, static first-frame image with no overlays -- the card looks like a simple product photo
- **On hover**: Animation begins from step 1 with labels, progress dots, and overlays appearing smoothly
- **On leave**: Fades back to the static first frame, resets the step counter
- **Only one card animates at a time** since users can only hover one card

### Technical Details

In `WorkflowAnimatedThumbnail.tsx`:
- The `isActive` prop will gate the `setInterval` that drives the animation
- When `isActive` changes to `false`, `activeStep` resets to `0`
- The step label and progress dots will fade in/out with the hover state
- All existing animation logic (crossfade, overlays, progress bars) stays intact -- just gated behind the hover

In `WorkflowCard.tsx`:
- A `const [isHovered, setIsHovered] = useState(false)` tracks the mouse state
- The thumbnail container gets `onMouseEnter={() => setIsHovered(true)}` and `onMouseLeave={() => setIsHovered(false)}`
- Pass `isActive={isHovered}` to the animated thumbnail component

