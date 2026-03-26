

# Fix Video Hub Performance — Lazy Loading & Playback

## Problem
All video cards render `<video src={url}>` simultaneously for every card in the grid. This means the browser tries to download/buffer up to 12 video files at once, causing massive lag, unresponsive play/pause controls, and high memory usage.

## Fix Strategy

### File: `src/pages/VideoHub.tsx`

**1. Lazy-load video elements — only mount `<video>` when the user interacts**
- Remove the always-present `<video>` element from the card
- Only create and mount the `<video>` element when the user hovers (desktop) or taps (mobile)
- Use `preload="none"` as a safety net

**2. Proper play/pause with async handling**
- `video.play()` returns a Promise — wrap in try/catch to avoid `AbortError` when pause is called before play resolves
- Track a loading state to prevent rapid click conflicts

**3. Better mobile tap behavior**
- First tap: play. Second tap: pause. No hover events on mobile.
- Show a loading spinner briefly while the video buffers

**4. Clean up on unmount**
- Use `useEffect` cleanup to pause and unload video when the component unmounts or scrolls out of view

### Key changes:
```text
Before: 12 <video src="..."> elements rendered at mount → 12 parallel downloads
After:  0 <video> elements at mount → 1 video loaded only on interaction
```

### Implementation details:
- State: `idle | loading | playing | paused`
- On hover/tap → set state to `loading`, mount `<video preload="auto">`, call `.play()` on `canplay` event
- On leave/second tap → `.pause()`, optionally unmount video element to free memory
- Wrap `.play()` in async try/catch for the common `AbortError` race condition
- Add `pointer-events-none` during loading state to prevent click spam

