Two changes.

## 1. Hero collage video tile (`CategoryHero.tsx`, ~lines 136–170)

The current tile uses the `poster` attribute and `preload="metadata"`, so the poster paints, then the video later swaps in — that's the "cut". Replace with a layered tile that always shows the poster as a base image and crossfades the video in once its first frame is decoded.

- Convert the tile to a small client component with `useRef`/`useState` for `ready`.
- Always render the poster `<img>` (same `posterSrc`) absolutely positioned, full-bleed, decoding="async" — this is the base layer.
- Render the `<video>` on top with `opacity-0` and `preload="auto"`, `autoPlay`, `muted`, `loop`, `playsInline`, `disableRemotePlayback`. Drop the `poster` attribute (the base image already covers that role).
- On `onLoadedData`, set `ready=true` and transition video to `opacity-100` over 400ms. On `canplay`, call `play().catch(...)`.
- Because the base image stays mounted behind the video forever, there is no flash and no perceived swap; the video simply fades in over a matching still frame.
- Keep the `motion-reduce:hidden` path for the video; the poster `<img>` remains visible in reduce-motion mode (replaces the old separate `motion-reduce:block` img).

This applies to all three hero pages (activewear / bags / swimwear) because they share the same `HeroCollageTile`.

## 2. Activewear "every shot" section copy (`CategoryBuiltForEveryCategory.tsx`)

Update the `activewear` branch only:
- Eyebrow: `AI photoshoots for activewear`
- Headline: `Activewear visuals without the fitness shoot`
- Subheadline: `Upload one product photo and create ad-ready visuals in minutes`

Bags and swimwear branches stay as they are. No terminal periods on single-sentence subtitles (per core memory).

## Out of scope

- No layout, sizing, or other copy changes.
- Motion grid (`CategoryMotionShowcase`) already has its skeleton/throttle pipeline; not touched.