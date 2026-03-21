

# Smooth Progress Bar Animation on TryShot

## Problem
The progress bar resets abruptly and uses a fixed 2400ms duration that doesn't match the actual word cycle time. The `linear` easing feels mechanical.

## Changes

### File: `src/pages/TryShot.tsx`

**1. Calculate accurate duration per word cycle**

Each word has a different length, so the cycle time varies. Calculate it dynamically:
- Typing: `chars × 80ms`
- Pause: `2000ms`  
- Deleting: `chars × 40ms`
- Total: `chars × 120 + 2000`

Store as a computed value and pass to the transition duration.

**2. Use double-rAF for glitch-free reset**

Replace the single `requestAnimationFrame` with a double-rAF to ensure the browser has fully painted the `width: 0%` before starting the fill transition:

```tsx
useEffect(() => {
  setProgress(0);
  const raf1 = requestAnimationFrame(() => {
    requestAnimationFrame(() => setProgress(100));
  });
  return () => cancelAnimationFrame(raf1);
}, [wordIndex]);
```

**3. Use `cubic-bezier` easing**

Replace `linear` with `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out) so the bar starts gently, accelerates, and slows at the end — feels much more polished.

**4. Update transition style**

```tsx
style={{
  width: `${progress}%`,
  transition: progress === 0 ? 'none' : `width ${cycleDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
}}
```

Where `cycleDuration` = `ROTATING_WORDS[wordIndex].length * 120 + 2000`.

## Summary
- 1 file, ~5 lines changed
- Duration synced to actual word cycle length
- Double-rAF eliminates reset flicker
- Smooth ease-in-out curve instead of linear

