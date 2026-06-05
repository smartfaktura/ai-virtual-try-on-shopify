## Goal

Replace the current shadcn `Dialog`-based Fresh Scenes preview with the same full-screen split-portal modal used by Explore "Steal the look" (`DiscoverDetailModal`) and Library (`SceneDetailModal`) — so all three preview experiences feel identical.

## Reference pattern (from `DiscoverDetailModal.tsx`)

- React portal rendered into `document.body`, `z-[200]`, locks body scroll, closes on Escape and backdrop click
- Black backdrop (`bg-black/90`) with fade animation
- Split layout: image left (`md:w-[60%] h-full`, `object-contain`, shadow) / panel right (`md:w-[40%] h-full bg-background`, slide-in-from-right)
- Mobile: stacks vertically — image `h-[45vh]`, panel `h-[55vh]` scrollable
- Close `X` icon top-right of the panel (not a button row)
- Smooth mount/unmount via `mounted`/`visible` state with 220ms exit delay

## Changes — `src/components/app/DashboardFreshScenes.tsx`

1. Remove the `Dialog` / `DialogContent` block (lines ~197–243) and its imports.
2. Add a new local `FreshScenePreviewModal` component (or inline render) that mirrors `DiscoverDetailModal`'s shell:
   - `createPortal` to `document.body`
   - Backdrop + split layout exactly as referenced above
   - Left: `ShimmerImage` with the scene's `preview_image_url`, 4:5 aspect, `object-contain`, rounded + shadow
   - Right panel content (Fresh Scenes specific, minimal):
     - Tiny uppercase eyebrow: collection label (`getCollectionLabel(...)`)
     - `h2` title: `scene.title` (same type scale as Discover modal — `text-2xl md:text-3xl font-semibold tracking-tight`)
     - Short description line (existing copy: "Use this look as the visual reference for your next product shoot")
     - Primary CTA `Button`: "Use this scene" (Sparkles icon) → calls existing `useScene(scene.scene_id)`
     - No secondary Close button in the panel — rely on the top-right `X` icon and backdrop click (matches Discover/Library)
   - Body scroll lock + Escape handler + mount/visibility animation (copy the small effect blocks from `DiscoverDetailModal`)
3. Keep all existing Fresh Scenes grid logic, `preview` state, and `setPreview(null)` close path unchanged — only the rendered modal shell changes.
4. Drop the now-unused imports (`Dialog`, `DialogContent`, `DialogTitle`, `DialogDescription`) and any classes that are no longer referenced.

## Out of scope

- No changes to Discover or Library modals
- No changes to scene data, routing, or `useScene` behavior
- No changes to the Fresh Scenes grid card styling

## Result

Fresh Scenes preview becomes a full-screen, dark, split-layout modal visually indistinguishable from Explore's "Steal the look" and Library's scene preview — image left, scene info + CTA right, top-right X to close, consistent animations across the app.
