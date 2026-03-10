

## Fix Team Carousel Auto-Scroll Jank

The current implementation uses `setInterval(fn, 30)` with `scrollLeft += 1` — this fires ~33 times/sec via JS timers, which aren't synced to the browser's paint cycle. Each tick also calls `updateScrollState()` which triggers React re-renders via `setState`. This causes visible lag and makes hover pause/resume feel janky.

### Root Causes
1. **`setInterval` at 30ms** — not frame-synced, causes jank
2. **`updateScrollState()` called every tick** — unnecessary re-renders 33x/sec
3. **Abrupt pause/resume on hover** — no easing

### Fix — `src/components/landing/StudioTeamSection.tsx`

1. **Replace `setInterval` with `requestAnimationFrame`** — smooth 60fps, frame-synced scrolling
2. **Use a speed variable** (e.g. `0.5px/frame`) instead of `1px/30ms` for smoother motion
3. **Remove `updateScrollState()` from the animation loop** — only call it on manual scroll events and after auto-scroll resets to start
4. **Ease hover pause/resume** — use a `targetSpeed` ref that lerps between 0 (hovered) and 0.5 (running), so the carousel decelerates/accelerates smoothly instead of stopping abruptly

### Key Code Shape

```typescript
const speedRef = useRef(0.5);
const targetSpeedRef = useRef(0.5);
const rafRef = useRef<number>(0);

useEffect(() => {
  const tick = () => {
    // Lerp speed toward target
    speedRef.current += (targetSpeedRef.current - speedRef.current) * 0.08;
    
    const el = scrollRef.current;
    if (el && speedRef.current > 0.01) {
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
        el.scrollTo({ left: 0 });
      }
      el.scrollLeft += speedRef.current;
    }
    rafRef.current = requestAnimationFrame(tick);
  };
  rafRef.current = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafRef.current);
}, []);

// Hover handlers just change the target
const handleMouseEnter = () => { targetSpeedRef.current = 0; };
const handleMouseLeave = () => { targetSpeedRef.current = 0.5; };
```

This eliminates all re-renders from the animation loop, syncs to the display refresh rate, and smoothly decelerates on hover instead of stopping instantly.

