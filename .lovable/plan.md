

## Optimize Team Video Loading on Landing Page

### Problem
All 10 team member videos (~10 MP4 files) begin downloading their metadata simultaneously as soon as the section enters the viewport. Since the carousel only shows ~4 cards at a time, 6+ videos are loading unnecessarily, competing for bandwidth and slowing visible content.

### Optimizations

**1. Defer video `src` until the card is scrolled into view**
- Currently `LazyVideo` sets `src` immediately on mount — the IntersectionObserver only controls play/pause
- Change: don't set the `src` attribute at all until the card's own IntersectionObserver fires; show the poster image until then
- This means only the ~4 visible cards load video; the rest stay as lightweight poster images

**2. Show poster image as a real `<img>` fallback layer**
- Render the avatar image behind the video so the user sees content instantly
- Once the video fires `canplay`, hide the image layer
- Eliminates the blank/black flash while the video buffers

**3. Use `preload="none"` instead of `preload="metadata"`**
- Since we're deferring the `src` anyway, when it does get set the browser should only start downloading when play is called
- Combined with the IntersectionObserver play trigger, this minimizes wasted bandwidth

### File
- `src/components/landing/StudioTeamSection.tsx` — update `LazyVideo` component

### Result
- Initial section load: 0 video network requests (just 4 small poster JPGs)
- As user scrolls through carousel: videos load on-demand, one or two at a time
- Perceived load time drops significantly

