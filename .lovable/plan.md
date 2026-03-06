

## Fix Mobile Touch Scrolling on Team Carousel

### Root Cause

The carousel has two things fighting the user's thumb on mobile:

1. **Auto-scroll runs during touch** — The `setInterval` increments `el.scrollLeft += 1` every 30ms. On desktop it pauses via `onMouseEnter`, but there's no equivalent `onTouchStart`/`onTouchEnd` handler, so on mobile the auto-scroll keeps pushing while the user tries to swipe.

2. **`snap-x snap-mandatory`** — Combined with the auto-scroll's pixel-by-pixel `scrollLeft` manipulation, mandatory snapping creates a "fighting" effect where the browser snaps to a card while the interval tries to move past it. This makes swiping feel jerky and stuck.

### Fix

**File: `src/components/landing/StudioTeamSection.tsx`**

| Change | Detail |
|--------|--------|
| Pause auto-scroll on touch | Add `onTouchStart` → set `isHoveredRef = true`, `onTouchEnd` → resume after 4s timeout so auto-scroll doesn't fight the thumb |
| Remove mandatory snap | Change `snap-x snap-mandatory` → free scroll (no snap classes). Per the project's carousel design convention: smooth free-scrolling, no snapping. |
| Hide arrows on mobile | Add `hidden sm:flex` to arrow buttons — they overlap cards on small screens and aren't useful with touch |
| Add `-webkit-overflow-scrolling: touch` | Ensures smooth momentum/inertia scrolling on iOS Safari |

No other files need changes. Card sizes stay the same as the user confirmed they're fine.

