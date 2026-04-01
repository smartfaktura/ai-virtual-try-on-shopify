

# Camera Motion Video Previews

## Approach
Upload the 10 preview videos to Supabase Storage, then show a thumbnail grid instead of plain chips. Each motion gets a small card with a looping video that plays on hover and pauses when not hovered. Click to select.

## Design
- Replace the flat chip row for "Camera Motion" with a horizontal scrollable grid of small cards (~80×80px or so)
- Each card: rounded-lg, border, motion label below the thumbnail
- **Video plays on hover** (muted, loop, inline) — pauses on mouse leave, resets to frame 0
- Selected card gets a primary border + subtle overlay check icon
- Videos served from Supabase Storage via `getOptimizedUrl` pattern (though video won't compress the same, we still use the CDN path)
- Use `poster` attribute or first-frame for initial static look — or just let the `<video>` element show its first frame with `preload="metadata"`

## Files

### 1. Upload videos to Supabase Storage
Upload all 10 videos to the `landing` bucket under `video-previews/` (e.g. `video-previews/static.mp4`, `video-previews/slow_push_in.mp4`, etc.)

### 2. `src/lib/videoMotionRecipes.ts`
Add a `preview` field to `CameraMotionOption`:
```ts
export interface CameraMotionOption {
  id: string;
  label: string;
  preview?: string; // storage path for preview video
}
```
Add the storage paths for each motion.

### 3. `src/components/app/video/CameraMotionGrid.tsx` (new)
New component rendering the preview grid:
- Accepts same props as ChipRow/MultiChipRow for camera motion
- Maps `CAMERA_MOTIONS` into small cards with `<video>` elements
- `onMouseEnter` → `videoRef.play()`, `onMouseLeave` → `videoRef.pause(); videoRef.currentTime = 0`
- Click → select/toggle
- Horizontally scrollable with `overflow-x-auto` and `flex-nowrap`
- Selected state: primary border + check badge

### 4. `src/components/app/video/MotionRefinementPanel.tsx`
Replace the `ChipRow`/`MultiChipRow` for Camera Motion with the new `CameraMotionGrid` component, passing the same props through.

## Multi-select support
The grid component will support both single and multi-select modes (same as current chip behavior), showing check icons on multi-selected cards.

