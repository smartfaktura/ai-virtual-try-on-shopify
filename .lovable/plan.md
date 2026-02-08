

## Freestyle Studio Redesign -- Modern Luxury UI + Scene Selector

Two main improvements: (1) a complete visual overhaul of the page to match the reference aesthetic, and (2) adding a Scene/Style selector chip that lets users pick from the existing 24 pose/environment library.

---

### Problem 1: The UI looks dated

The current prompt bar uses plain HTML textarea styling with harsh borders, small images, and a utilitarian layout. The reference shows a sleek, immersive experience where images fill the screen edge-to-edge and the prompt bar floats as a polished overlay.

**What changes:**

- **Gallery**: Switch from small grid with gaps to a large, immersive masonry layout. Images should be significantly larger -- 2 columns on mobile, 2-3 columns on desktop with minimal 2px gaps. Images fill the available space like a photo wall, not small thumbnails floating in whitespace.

- **Prompt Bar**: Transform from a flat bordered textarea into a floating, rounded container with a frosted-glass/dark-glass aesthetic. The prompt area becomes a clean, borderless input inside a dark rounded container with subtle inner glow instead of a hard border. The + button and Generate button sit inline within this container.

- **Settings Chips**: Refine the chip row with slightly more padding, smoother hover states, and a more polished feel. Add subtle backdrop blur to the entire bottom bar.

- **Empty State**: Make it more visually inviting with larger icon and softer typography.

- **Loading State**: Move the progress indicator into the prompt bar area itself (subtle progress line at the top of the bar).

---

### Problem 2: No Scene/Style selector

Users currently can only type free-text prompts with no way to pick from the existing library of 24 professional scenes/environments (Studio, Lifestyle, Editorial, Streetwear). Adding this as a chip gives quick access to curated scene descriptions.

**What changes:**

- Add a new **Scene** chip next to the Model chip in the settings row
- Clicking it opens a popover showing scene thumbnails grouped by category (Studio, Lifestyle, Editorial, Streetwear)
- When a scene is selected, its description is used as additional context for the generation (appended to the prompt or sent as a separate parameter)
- The chip shows the selected scene name or "No Scene" by default
- The scene data comes from the existing `mockTryOnPoses` array and pose images

---

### Technical Details

**File to modify: `src/pages/Freestyle.tsx`** (single file, complete rewrite of the JSX)

**Imports to add:**
- `mockTryOnPoses`, `poseCategoryLabels` from `@/data/mockData`
- `TryOnPose` type from `@/types`
- `Camera` icon from `lucide-react` (for the Scene chip)

**State to add:**
- `selectedScene: TryOnPose | null` (default: null)
- `scenePopoverOpen: boolean`

**Gallery changes (lines ~117-158):**
- Empty state: Larger icon (w-24 h-24), lighter weight heading, more breathing room
- Grid: Change to `grid-cols-2 lg:grid-cols-3 gap-0.5` for edge-to-edge photo wall feel
- Remove `aspect-square` constraint -- let images display at natural ratio or use taller aspect ratios
- Add rounded corners only to the outer container, not individual images
- Hover overlay: Smooth gradient from bottom instead of full overlay, with download button positioned bottom-right

**Prompt bar changes (lines ~173-360):**
- Outer container: Remove `border-t`, use `bg-[#1a1a2e]/95 backdrop-blur-xl` with rounded-2xl top corners, add subtle shadow upward
- Prompt textarea: Remove border entirely, make it transparent background inside the dark container with lighter placeholder text. Increase font size slightly.
- The + button: More refined circle with subtle ring on hover
- Generate button: Larger, with gradient or accent color, rounded-xl
- Settings chips: Slightly larger padding (px-3.5 py-2), refined borders with `border-white/8`

**Scene chip (new, in settings row):**
- Positioned after Model chip
- Shows selected scene thumbnail (tiny 16px circle) + name, or `Camera` icon + "No Scene"
- Popover shows a scrollable grid of scene thumbnails grouped by category
- Each category has a small label (Studio, Lifestyle, Editorial, Streetwear)
- Clicking a scene selects it and closes popover

**Generation logic update:**
- When a scene is selected, append the scene description to the prompt before sending
- Pass scene info to the edge function as additional context
- The edge function already handles prompt polishing, so the scene description will be naturally incorporated

**No changes needed to:**
- `useGenerateFreestyle.ts` -- the scene context gets merged into the prompt string before calling
- `generate-freestyle` edge function -- receives the enhanced prompt as-is
- `mockData.ts` -- uses existing `mockTryOnPoses` data
- `AppShell.tsx` or `App.tsx` -- no routing changes

