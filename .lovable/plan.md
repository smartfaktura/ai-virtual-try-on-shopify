

## Redo Interior/Exterior Staging Animation — Style Cycling

The current animation uses a generic unsplash image with floating badge elements. The user wants it replaced with their actual images: an empty room that cycles through 3 different staging styles.

### Approach

Use the existing `carousel` mode (already built for "Selfie / UGC Set") but adapted for a staging-specific feel:

1. **Copy the 4 uploaded images to `public/images/staging/`**:
   - `staging-empty.png` — the empty room (base)
   - `staging-japandi.png` — Japandi style result
   - `staging-eclectic.png` — Eclectic/bohemian style result  
   - `staging-contemporary.png` — Contemporary style result

2. **Update `workflowAnimationData.tsx`** — Change the `'Interior / Exterior Staging'` entry to use `mode: 'carousel'` with:
   - `background`: the empty room image
   - `backgrounds`: array of [empty room, japandi, eclectic, contemporary] cycling through
   - `elements`: a "Room Photo" badge (top-left) and a style name badge (bottom-left) that stays persistent
   - The carousel mode already handles crossfade transitions and progress bar

3. **Enhance the carousel for staging** — Add a small tweak: for the staging card, the first frame shows the empty room with "Empty Room" badge, then cycles to styled versions. The existing `CarouselThumbnail` component handles crossfade + progress bar already, so this mostly works out of the box.

### Files to change
- Copy 4 images to `public/images/staging/`
- `src/components/app/workflowAnimationData.tsx` — update the Interior/Exterior Staging scene definition to use carousel mode with the 4 real images

### Result
The animation card will show the empty room, then crossfade to Japandi style, then Eclectic, then Contemporary, cycling with a progress bar — demonstrating "1 click, different styles generated."

