Polish the loading experience on the swimwear / bags / activewear pages so feed images and motion grids don't pop or stutter on slow connections.

## 1. Feed image (`CategoryFeedShowcase.tsx`)

- Add `isLoaded` state on the image; render it `opacity-0` until `onLoad`, then transition to `opacity-100` over 500ms.
- Keep a low-cost shimmer behind it: inside the framed div add an absolutely-positioned skeleton layer (`bg-muted/40` with a soft `animate-pulse`) that fades out via `isLoaded`.
- Add explicit `width`/`height` attributes derived from the existing `1127 / 2000` aspect to prevent any CLS while loading.

## 2. Motion grid (`CategoryMotionShowcase.tsx`)

Replace the all-autoplay strategy with a gated, per-tile load+play state machine.

- Each tile owns `{ ready, buffering }` state.
- Default `preload="none"` and `autoPlay={false}` on every `<video>`. Drop the `src` attribute initially; mount it only when the tile enters a 400px rootMargin window via the existing `IntersectionObserver`.
- Listen for:
  - `loadeddata` → set `ready=true` (fade tile from skeleton to video).
  - `canplay` → call `.play().catch(...)`.
  - `waiting` / `stalled` → set `buffering=true` (shimmer overlay returns).
  - `playing` → `buffering=false`.
- Render a skeleton layer (gradient + `animate-pulse`) behind each video, visible while `!ready || buffering`. Video sits at `opacity-0` until `ready` then transitions to `opacity-100` over 400ms.
- Honor existing `prefers-reduced-motion` and `navigator.connection.saveData` short-circuits: in those modes, never set the `src`, just keep the skeleton with a tiny static frame badge.
- Throttle concurrent loads: only attach `src` for at most 2 tiles at a time; when a tile reaches `playing`, allow the next pending tile to start. This avoids the "everything competes for bandwidth" cut-cut-cut effect on slower networks.

## Out of scope

- No copy, layout, or visual hierarchy changes.
- No new dependencies.
- Other category pages are untouched (gating already limits the components to bags/swimwear/activewear).