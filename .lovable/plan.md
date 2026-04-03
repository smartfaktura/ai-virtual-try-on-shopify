

# Fix HomeHero — Output Cards Not Rendering

## Problem
The 4 output cards (Product page, Social ad, Lifestyle, Editorial) are invisible. Only the center "Original" card displays. The bento grid layout collapses the corner cards.

## Root Cause
The `OutputCard` component uses `style={{ aspectRatio: '3/4' }}` on the inner div, but the wrapping grid cell `<div className="flex items-center">` has no width constraint. The `aspect-ratio` property needs a defined width to compute height — without it, the element collapses to zero size.

## Fix in `src/components/home/HomeHero.tsx`

1. **Give output card wrappers `w-full`** — each grid cell wrapping an OutputCard needs `w-full` so the card fills its grid column
2. **Add `w-full` to the OutputCard root div** — ensure the card stretches to fill its container
3. **Verify the `useRotatingIndex` cleanup** — the current hook has a bug: the `setTimeout` callback returns a cleanup function from `setInterval`, but that return value is ignored inside `setTimeout`. Fix by storing the interval ID in a ref or variable and clearing it in the timeout's cleanup.

### useRotatingIndex fix
```typescript
function useRotatingIndex(length: number, intervalMs: number, delay = 0) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      intervalId = setInterval(() => setIdx((i) => (i + 1) % length), intervalMs);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [length, intervalMs, delay]);
  return idx;
}
```

### Grid cell fix
Change the output card wrapper from:
```tsx
<div className={`${col} ${row} flex items-center`}>
```
to:
```tsx
<div className={`${col} ${row} flex items-center w-full`}>
```

## File Modified
- `src/components/home/HomeHero.tsx`

