

# Fix: Wizard Steps Not Scrolling to Top

## Problem
The Product Images wizard calls `window.scrollTo({ top: 0 })` on step change, but the actual scrollable container is the `<main id="app-main-scroll">` element inside `AppShell` (which has `overflow-y-auto`). The window itself never scrolls, so the call has no effect.

## Fix

### `src/pages/ProductImages.tsx`
Replace the existing `window.scrollTo` call (line 226) with:

```typescript
useEffect(() => {
  const el = document.getElementById('app-main-scroll');
  if (el) {
    el.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}, [step]);
```

This targets the actual scroll container used by `AppShell`. The `window` fallback handles edge cases where the shell might not be present.

## Files
- `src/pages/ProductImages.tsx` — one line change in the scroll useEffect

